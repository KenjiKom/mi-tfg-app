import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';  
import '../styles/Admin.css';  

const AdminAsig = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [currentAsignatura, setCurrentAsignatura] = useState(null);
  const [nombre, setNombre] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:5000/admin/asignaturas')
      .then(response => setAsignaturas(response.data))
      .catch(error => console.error('Error al obtener las asignaturas:', error));
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/asignaturas/${id}`)
      .then(() => {
        setAsignaturas(asignaturas.filter(asignatura => asignatura.id !== id));
      })
      .catch(error => console.error('Error al eliminar la asignatura:', error));
  };

  const handleEdit = (asignatura) => {
    setCurrentAsignatura(asignatura);
    setNombre(asignatura.Nombre);
  };

  const handleSubmit = () => {
    const asignaturaData = { Nombre: nombre };

    if (currentAsignatura) {
      axios.put(`http://localhost:5000/admin/asignaturas/${currentAsignatura.id}`, asignaturaData)
        .then(response => {
          setAsignaturas(asignaturas.map(asignatura => 
            asignatura.id === currentAsignatura.id ? response.data : asignatura
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar la asignatura:', error));
    } else {
      axios.post('http://localhost:5000/admin/asignaturas', asignaturaData)
        .then(response => {
          setAsignaturas([...asignaturas, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar la asignatura:', error));
    }
  };

  const resetForm = () => {
    setCurrentAsignatura(null);
    setNombre('');
  };

  const filteredAsignaturas = asignaturas.filter(asignatura => 
    asignatura.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAsignaturas = filteredAsignaturas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAsignaturas.length / itemsPerPage);

  return (
    <div className="page-container">
      <main id="content" className="admin-container">
        <Header/>
        
        <div className="admin-content-wrapper">
          {/* Formulario a la izquierda */}
          <div className="admin-form">
            <div className="form-header">
              <h2 className="form-title">Gestión de Asignaturas</h2>
            </div>
            
            <div className="form-group compact-group">
              <label htmlFor="nombre">Nombre de la asignatura</label>
              <input 
                id="nombre"
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Ej: Matemáticas Avanzadas" 
                className="form-control compact-input"
              />
            </div>

            <div className="form-actions compact-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>
                {currentAsignatura ? 'Actualizar' : 'Agregar'}
              </button>
              {currentAsignatura && (
                <button className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Tabla de asignaturas a la derecha */}
          <div className="admin-table-container">
            <div className="admin-search">
              <input 
                type="text" 
                placeholder="Buscar asignatura..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="admin-input"
              />
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentAsignaturas.map((asignatura) => (
                  <tr key={asignatura.id}>
                    <td>{asignatura.Nombre}</td>
                    <td>
                      <div className="admin-actions">
                        <button 
                          className="admin-button edit" 
                          onClick={() => handleEdit(asignatura)}
                        >
                          Editar
                        </button>
                        <button 
                          className="admin-button delete" 
                          onClick={() => handleDelete(asignatura.id)}
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

export default AdminAsig;