import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';  
import '../styles/Admin.css';  

const AdminMat = () => {
  const [matriculas, setMatriculas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [currentMatricula, setCurrentMatricula] = useState(null);
  const [idUsuario, setIdUsuario] = useState('');
  const [idAsignatura, setIdAsignatura] = useState('');
  const [curso, setCurso] = useState('');
  const [nota, setNota] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:5000/admin/matriculas')
      .then(response => setMatriculas(response.data))
      .catch(error => console.error('Error al obtener las matrículas:', error));
    
    axios.get('http://localhost:5000/admin/usuarios')
      .then(response => setUsuarios(response.data))
      .catch(error => console.error('Error al obtener los usuarios:', error));
    
    axios.get('http://localhost:5000/admin/asignaturas')
      .then(response => setAsignaturas(response.data))
      .catch(error => console.error('Error al obtener las asignaturas:', error));
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/matriculas/${id}`)
      .then(() => {
        setMatriculas(matriculas.filter(matricula => matricula.id !== id));
      })
      .catch(error => console.error('Error al eliminar la matrícula:', error));
  };

  const handleEdit = (matricula) => {
    setCurrentMatricula(matricula);
    setIdUsuario(matricula.id_usuario);
    setIdAsignatura(matricula.id_asignatura);
    setCurso(matricula.Curso);
    setNota(matricula.Nota);
  };

  const handleSubmit = () => {
    const matriculaData = { id_usuario: idUsuario, id_asignatura: idAsignatura, Curso: curso, Nota: nota };

    if (currentMatricula) {
      axios.put(`http://localhost:5000/admin/matriculas/${currentMatricula.id}`, matriculaData)
        .then(response => {
          setMatriculas(matriculas.map(matricula => 
            matricula.id === currentMatricula.id ? response.data : matricula
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar la matrícula:', error));
    } else {
      axios.post('http://localhost:5000/admin/matriculas', matriculaData)
        .then(response => {
          setMatriculas([...matriculas, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar la matrícula:', error));
    }
  };

  const resetForm = () => {
    setCurrentMatricula(null);
    setIdUsuario('');
    setIdAsignatura('');
    setCurso('');
    setNota('');
  };

  const filteredMatriculas = matriculas.filter(matricula => 
    matricula.Curso.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMatriculas = filteredMatriculas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMatriculas.length / itemsPerPage);

  return (
    <main id="content" className="admin-container">
      <Header/>
      {/* Formulario a la izquierda */}
      <div className="admin-form">
        <h2>Gestión de Matrículas</h2>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Buscar por curso" 
        />
        <select value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)}>
          <option value="">Seleccionar Usuario</option>
          {usuarios.map(usuario => (
            <option key={usuario.id} value={usuario.id}>{usuario.Nombre}</option>
          ))}
        </select>
        <select value={idAsignatura} onChange={(e) => setIdAsignatura(e.target.value)}>
          <option value="">Seleccionar Asignatura</option>
          {asignaturas.map(asignatura => (
            <option key={asignatura.id} value={asignatura.id}>{asignatura.Nombre}</option>
          ))}
        </select>
        <input 
          type="text" 
          value={curso} 
          onChange={(e) => setCurso(e.target.value)} 
          placeholder="Curso" 
        />
        <input 
          type="number" 
          value={nota} 
          onChange={(e) => setNota(e.target.value)} 
          placeholder="Nota" 
          step="0.1" 
        />
        <button className="admin-button" onClick={handleSubmit}>
          {currentMatricula ? 'Actualizar' : 'Agregar'}
        </button>
      </div>

      {/* Tabla de matrículas a la derecha */}
      <div className="admin-table-container">
        <div className="admin-search">
          <input 
            type="text" 
            placeholder="Buscar matrícula..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Asignatura</th>
              <th>Curso</th>
              <th>Nota</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentMatriculas.map(matricula => (
              <tr key={matricula.id}>
                <td>{matricula.id_usuario}</td>
                <td>{matricula.id_asignatura}</td>
                <td>{matricula.Curso}</td>
                <td>{matricula.Nota}</td>
                <td>
                  <button className="admin-button" onClick={() => handleEdit(matricula)}>Editar</button>
                  <button className="admin-button" onClick={() => handleDelete(matricula.id)}>Eliminar</button>
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

export default AdminMat;