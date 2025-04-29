import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';  
import '../styles/Admin.css';  

const AdminCourse = () => {
  const [cursos, setCursos] = useState([]);
  const [currentCurso, setCurrentCurso] = useState(null);
  const [nombre, setNombre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:5000/admin/cursos')
      .then(response => setCursos(response.data))
      .catch(error => console.error('Error al obtener los cursos:', error));
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/cursos/${id}`)
      .then(() => {
        setCursos(cursos.filter(curso => curso.id !== id));
      })
      .catch(error => console.error('Error al eliminar el curso:', error));
  };

  const handleEdit = (curso) => {
    setCurrentCurso(curso);
    setNombre(curso.Nombre);
  };

  const handleSubmit = () => {
    const cursoData = { Nombre: nombre };

    if (currentCurso) {
      axios.put(`http://localhost:5000/admin/cursos/${currentCurso.id}`, cursoData)
        .then(response => {
          setCursos(cursos.map(curso => 
            curso.id === currentCurso.id ? response.data : curso
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar el curso:', error));
    } else {
      axios.post('http://localhost:5000/admin/cursos', cursoData)
        .then(response => {
          setCursos([...cursos, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar el curso:', error));
    }
  };

  const resetForm = () => {
    setCurrentCurso(null);
    setNombre('');
  };

  const filteredCursos = cursos.filter(curso => 
    curso.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCursos = filteredCursos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCursos.length / itemsPerPage);

  return (
    <div className="page-container">
      <main id="content" className="admin-container">
        <Header/>
        
        <div className="admin-content-wrapper">
          {/* Formulario a la izquierda */}
          <div className="admin-form">
            <div className="form-header">
              <h2 className="form-title">Gestión de Cursos</h2>
            </div>
            
            <div className="form-group compact-group">
              <label htmlFor="nombre">Nombre del curso</label>
              <input 
                id="nombre"
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Ej: 2025-26" 
                className="form-control compact-input"
              />
            </div>

            <div className="form-actions compact-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>
                {currentCurso ? 'Actualizar' : 'Agregar'}
              </button>
              {currentCurso && (
                <button className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Tabla de cursos a la derecha */}
          <div className="admin-table-container">
            <div className="admin-search">
              <input 
                type="text" 
                placeholder="Buscar curso..." 
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
                {currentCursos.map((curso) => (
                  <tr key={curso.id}>
                    <td>{curso.Nombre}</td>
                    <td>
                      <div className="admin-actions">
                        <button 
                          className="admin-button edit" 
                          onClick={() => handleEdit(curso)}
                        >
                          Editar
                        </button>
                        <button 
                          className="admin-button delete" 
                          onClick={() => handleDelete(curso.id)}
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

export default AdminCourse;