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

  // Obtener todos los cursos al cargar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/admin/cursos')
      .then(response => setCursos(response.data))
      .catch(error => console.error('Error al obtener los cursos:', error));
  }, []);

  // Manejar el borrado de un curso
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/cursos/${id}`)
      .then(() => {
        setCursos(cursos.filter(curso => curso.id !== id));
      })
      .catch(error => console.error('Error al eliminar el curso:', error));
  };

  // Manejar la edición de un curso
  const handleEdit = (curso) => {
    setCurrentCurso(curso);
    setNombre(curso.Nombre);
  };

  // Manejar el formulario de agregar o editar
  const handleSubmit = () => {
    const cursoData = { Nombre: nombre };

    if (currentCurso) {
      // Actualizar curso
      axios.put(`http://localhost:5000/admin/cursos/${currentCurso.id}`, cursoData)
        .then(response => {
          setCursos(cursos.map(curso => 
            curso.id === currentCurso.id ? response.data : curso
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar el curso:', error));
    } else {
      // Crear nuevo curso
      axios.post('http://localhost:5000/admin/cursos', cursoData)
        .then(response => {
          setCursos([...cursos, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar el curso:', error));
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setCurrentCurso(null);
    setNombre('');
  };

  // Filtrar cursos por nombre
  const filteredCursos = cursos.filter(curso => 
    curso.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCursos = filteredCursos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCursos.length / itemsPerPage);

  return (
    <main id="content" className="admin-container">
      <Header/>
      {/* Formulario a la izquierda */}
      <div className="admin-form">
        <h2>Gestión de Cursos</h2>
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          placeholder="Nombre del curso" 
        />
        <button className="admin-button" onClick={handleSubmit}>
          {currentCurso ? 'Actualizar' : 'Agregar'}
        </button>
      </div>

      {/* Tabla de cursos a la derecha */}
      <div className="admin-table-container">
        <div className="admin-search">
          <input 
            type="text" 
            placeholder="Buscar curso..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
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
                  <button className="admin-button" onClick={() => handleEdit(curso)}>Editar</button>
                  <button className="admin-button" onClick={() => handleDelete(curso.id)}>Eliminar</button>
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

export default AdminCourse;