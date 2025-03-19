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
  const itemsPerPage = 5;

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
          setEventos(eventos.map(evento => 
            evento.id === currentEvento.id ? response.data : evento
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

  const filteredEventos = eventos.filter(evento => 
    evento.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEventos = filteredEventos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEventos.length / itemsPerPage);

  return (
    <main id="content" className="admin-container">
      <Header/>
      {/* Formulario a la izquierda */}
      <div className="admin-form">
        <h2>Gestión de Eventos</h2>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Buscar por nombre" 
        />
        <select value={idMatricula} onChange={(e) => setIdMatricula(e.target.value)}>
          <option value="">Seleccionar Matrícula</option>
          {matriculas.map(matricula => (
            <option key={matricula.id} value={matricula.id}>{matricula.Curso}</option>
          ))}
        </select>
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          placeholder="Nombre" 
        />
        <input 
          type="text" 
          value={hora} 
          onChange={(e) => setHora(e.target.value)} 
          placeholder="Hora" 
        />
        <input 
          type="text" 
          value={afectado} 
          onChange={(e) => setAfectado(e.target.value)} 
          placeholder="Afectado" 
        />
        <input 
          type="text" 
          value={contexto} 
          onChange={(e) => setContexto(e.target.value)} 
          placeholder="Contexto" 
        />
        <input 
          type="text" 
          value={componente} 
          onChange={(e) => setComponente(e.target.value)} 
          placeholder="Componente" 
        />
        <input 
          type="text" 
          value={evento} 
          onChange={(e) => setEvento(e.target.value)} 
          placeholder="Evento" 
        />
        <input 
          type="text" 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)} 
          placeholder="Descripción" 
        />
        <input 
          type="text" 
          value={origen} 
          onChange={(e) => setOrigen(e.target.value)} 
          placeholder="Origen" 
        />
        <input 
          type="text" 
          value={ip} 
          onChange={(e) => setIp(e.target.value)} 
          placeholder="IP" 
        />
        <button className="admin-button" onClick={handleSubmit}>
          {currentEvento ? 'Actualizar' : 'Agregar'}
        </button>
      </div>

      {/* Tabla de eventos a la derecha */}
      <div className="admin-table-container">
        <div className="admin-search">
          <input 
            type="text" 
            placeholder="Buscar evento..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Hora</th>
              <th>Afectado</th>
              <th>Contexto</th>
              <th>Componente</th>
              <th>Evento</th>
              <th>Descripción</th>
              <th>Origen</th>
              <th>IP</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentEventos.map(evento => (
              <tr key={evento.id}>
                <td>{evento.Nombre}</td>
                <td>{evento.Hora}</td>
                <td>{evento.Afectado}</td>
                <td>{evento.Contexto}</td>
                <td>{evento.Componente}</td>
                <td>{evento.Evento}</td>
                <td>{evento.Descripcion}</td>
                <td>{evento.Origen}</td>
                <td>{evento.Ip}</td>
                <td>
                  <button className="admin-button" onClick={() => handleEdit(evento)}>Editar</button>
                  <button className="admin-button" onClick={() => handleDelete(evento.id)}>Eliminar</button>
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
          <span>{currentPage} - {totalPages}</span>
          <button 
            className="pagination-button" 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
      <Footer/>
    </main>
  );
};

export default AdminEvent;