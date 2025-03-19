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

  // Obtener todas las asignaturas al cargar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/admin/asignaturas')
      .then(response => setAsignaturas(response.data))
      .catch(error => console.error('Error al obtener las asignaturas:', error));
  }, []);

  // Manejar el borrado de una asignatura
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/asignaturas/${id}`)
      .then(() => {
        setAsignaturas(asignaturas.filter(asignatura => asignatura.id !== id));
      })
      .catch(error => console.error('Error al eliminar la asignatura:', error));
  };

  // Manejar la edición de una asignatura
  const handleEdit = (asignatura) => {
    setCurrentAsignatura(asignatura);
    setNombre(asignatura.Nombre);
  };

  // Manejar el formulario de agregar o editar
  const handleSubmit = () => {
    const asignaturaData = { Nombre: nombre };

    if (currentAsignatura) {
      // Actualizar asignatura
      axios.put(`http://localhost:5000/admin/asignaturas/${currentAsignatura.id}`, asignaturaData)
        .then(response => {
          setAsignaturas(asignaturas.map(asignatura => 
            asignatura.id === currentAsignatura.id ? response.data : asignatura
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar la asignatura:', error));
    } else {
      // Crear nueva asignatura
      axios.post('http://localhost:5000/admin/asignaturas', asignaturaData)
        .then(response => {
          setAsignaturas([...asignaturas, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar la asignatura:', error));
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setCurrentAsignatura(null);
    setNombre('');
  };

  // Filtrar asignaturas según el término de búsqueda
  const filteredAsignaturas = asignaturas.filter(asignatura => 
    asignatura.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAsignaturas = filteredAsignaturas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAsignaturas.length / itemsPerPage);

  return (
    <main id="content" className="admin-container">
      <Header/>
      {/* Formulario a la izquierda */}
      <div className="admin-form">
        <h2>Gestión de Asignaturas</h2>
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          placeholder="Nombre de la asignatura" 
        />
        <button className="admin-button" onClick={handleSubmit}>
          {currentAsignatura ? 'Actualizar' : 'Agregar'}
        </button>
      </div>

      {/* Tabla de asignaturas a la derecha */}
      <div className="admin-table-container">
        <div className="admin-search">
          <input 
            type="text" 
            placeholder="Buscar asignatura..." 
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
            {currentAsignaturas.map((asignatura) => (
              <tr key={asignatura.id}>
                <td>{asignatura.Nombre}</td>
                <td>
                  <button className="admin-button" onClick={() => handleEdit(asignatura)}>Editar</button>
                  <button className="admin-button" onClick={() => handleDelete(asignatura.id)}>Eliminar</button>
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

export default AdminAsig;