import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';  
import '../styles/Admin.css';  

const AdminEvent = () => {
  const [eventos, setEventos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [currentEvento, setCurrentEvento] = useState(null);
  const [idMatricula, setIdMatricula] = useState('');
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');
  const [afectado, setAfectado] = useState('');
  const [contexto, setContexto] = useState('');
  const [componente, setComponente] = useState('');
  const [evento, setEvento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [origen, setOrigen] = useState('');
  const [ip, setIp] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 17;

  useEffect(() => {
    axios.get('http://localhost:5000/admin/eventos')
      .then(response => setEventos(response.data))
      .catch(error => console.error('Error al obtener los eventos:', error));

    axios.get('http://localhost:5000/admin/matriculas')
      .then(response => setMatriculas(response.data))
      .catch(error => console.error('Error al obtener las matrículas:', error));
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/eventos/${id}`)
      .then(() => {
        setEventos(eventos.filter(evento => evento.id !== id));
      })
      .catch(error => console.error('Error al eliminar el evento:', error));
  };

  const handleEdit = (evento) => {
    setCurrentEvento(evento);
    setIdMatricula(evento.id_matricula);
    setHora(evento.Hora);
    setNombre(evento.Nombre);
    setAfectado(evento.Afectado);
    setContexto(evento.Contexto);
    setComponente(evento.Componente);
    setEvento(evento.Evento);
    setDescripcion(evento.Descripcion);
    setOrigen(evento.Origen);
    setIp(evento.Ip);
  };

  const handleSubmit = () => {
    const eventoData = { 
      id_matricula: idMatricula, 
      Hora: hora, 
      Nombre: nombre, 
      Afectado: afectado, 
      Contexto: contexto, 
      Componente: componente, 
      Evento: evento, 
      Descripcion: descripcion, 
      Origen: origen, 
      Ip: ip 
    };

    if (currentEvento) {
      axios.put(`http://localhost:5000/admin/eventos/${currentEvento.id}`, eventoData)
        .then(response => {
          setEventos(eventos.map(e => 
            e.id === currentEvento.id ? response.data : e
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar el evento:', error));
    } else {
      axios.post('http://localhost:5000/admin/eventos', eventoData)
        .then(response => {
          setEventos([...eventos, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar el evento:', error));
    }
  };

  const resetForm = () => {
    setCurrentEvento(null);
    setIdMatricula('');
    setHora('');
    setNombre('');
    setAfectado('');
    setContexto('');
    setComponente('');
    setEvento('');
    setDescripcion('');
    setOrigen('');
    setIp('');
  };

  const filteredEventos = eventos.filter(e => 
    e.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEventos = filteredEventos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEventos.length / itemsPerPage);

  return (
    <div className="page-container">
      <main id="content" className="admin-container">
        <Header/>

        <div className="admin-content-wrapper">
          {/* Formulario a la izquierda */}
          <div className="admin-form">
            <div className="form-header">
              <h2 className="form-title">Gestión de Eventos</h2>
            </div>

            <div className="form-group compact-group">
              <label htmlFor="matricula">Matrícula</label>
              <select 
                id="matricula"
                value={idMatricula} 
                onChange={(e) => setIdMatricula(e.target.value)}
                className="form-control compact-input"
              >
                <option value="">Seleccionar Matrícula</option>
                {matriculas.map(m => (
                  <option key={m.id} value={m.id}>{m.id}</option>
                ))}
              </select>
            </div>

            {[
              { id: 'hora', value: hora, setter: setHora, label: 'Hora' },
              { id: 'nombre', value: nombre, setter: setNombre, label: 'Nombre' },
              { id: 'afectado', value: afectado, setter: setAfectado, label: 'Afectado' },
              { id: 'contexto', value: contexto, setter: setContexto, label: 'Contexto' },
              { id: 'componente', value: componente, setter: setComponente, label: 'Componente' },
              { id: 'evento', value: evento, setter: setEvento, label: 'Evento' },
              { id: 'descripcion', value: descripcion, setter: setDescripcion, label: 'Descripción' },
              { id: 'origen', value: origen, setter: setOrigen, label: 'Origen' },
              { id: 'ip', value: ip, setter: setIp, label: 'IP' },
            ].map(({ id, value, setter, label }) => (
              <div className="form-group compact-group" key={id}>
                <label htmlFor={id}>{label}</label>
                <input 
                  id={id}
                  type="text"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="form-control compact-input"
                />
              </div>
            ))}

            <div className="form-actions compact-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>
                {currentEvento ? 'Actualizar' : 'Agregar'}
              </button>
              {currentEvento && (
                <button className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Tabla de eventos a la derecha */}
          <div className="admin-table-container">
            <div className="admin-search">
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="admin-input"
              />
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Nombre</th>
                  <th>Evento</th>
                  <th>IP</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentEventos.map(evento => (
                  <tr key={evento.id}>
                    <td>{evento.Hora}</td>
                    <td>{evento.Nombre}</td>
                    <td>{evento.Evento}</td>
                    <td>{evento.Ip}</td>
                    <td>
                      <div className="admin-actions">
                        <button 
                          className="admin-button edit" 
                          onClick={() => handleEdit(evento)}
                        >
                          Editar
                        </button>
                        <button 
                          className="admin-button delete" 
                          onClick={() => handleDelete(evento.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Controles de paginación */}
            <div className="pagination">
              <button 
                className="pagination-button" 
                onClick={() => setCurrentPage(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button 
                className="pagination-button" 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        <Footer/>
      </main>
    </div>
  );
};

export default AdminEvent;
