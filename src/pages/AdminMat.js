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
  const [cursos, setCursos] = useState([]); // Cambiado de setCurso a setCursos
  const [cursoSeleccionado, setCursoSeleccionado] = useState(''); // Nuevo estado para el curso seleccionado
  const [nota, setNota] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

    axios.get('http://localhost:5000/asignaturas/todos-cursos')
      .then(response => setCursos(response.data))
      .catch(error => console.error('Error al obtener los cursos:', error));
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
    setCursoSeleccionado(matricula.Curso); // Usamos el nuevo estado
    setNota(matricula.Nota);
  };

  const handleSubmit = () => {
    const matriculaData = { 
      id_usuario: idUsuario, 
      id_asignatura: idAsignatura, 
      Curso: cursoSeleccionado, // Usamos el nuevo estado
      Nota: nota 
    };

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
    setCursoSeleccionado('');
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
    <div className="page-container">
      <main id="content" className="admin-container">
        <Header/>
        
        <div className="admin-content-wrapper">
          {/* Formulario a la izquierda */}
          <div className="admin-form">
            <div className="form-header">
              <h2 className="form-title">Gestión de Matrículas</h2>
            </div>

            <div className="form-group compact-group">
              <label htmlFor="usuario">Usuario</label>
              <select 
                id="usuario"
                value={idUsuario} 
                onChange={(e) => setIdUsuario(e.target.value)}
                className="form-control compact-input"
              >
                <option value="">Seleccionar Usuario</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>{usuario.Nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group compact-group">
              <label htmlFor="asignatura">Asignatura</label>
              <select 
                id="asignatura"
                value={idAsignatura} 
                onChange={(e) => setIdAsignatura(e.target.value)}
                className="form-control compact-input"
              >
                <option value="">Seleccionar Asignatura</option>
                {asignaturas.map(asignatura => (
                  <option key={asignatura.id} value={asignatura.id}>{asignatura.Nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group compact-group">
              <label htmlFor="curso">Curso</label>
              <select 
                id="curso"
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
                className="form-control compact-input"
              >
                <option value="">Seleccionar Curso</option>
                {Array.isArray(cursos) && cursos.map(curso => (
                  <option key={curso.id} value={curso.Nombre}>{curso.Nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group compact-group">
              <label htmlFor="nota">Nota</label>
              <input 
                id="nota"
                type="number" 
                value={nota} 
                onChange={(e) => setNota(e.target.value)} 
                placeholder="Ej: 7.5" 
                step="0.1"
                className="form-control compact-input"
              />
            </div>

            <div className="form-actions compact-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>
                {currentMatricula ? 'Actualizar' : 'Agregar'}
              </button>
              {currentMatricula && (
                <button className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Tabla de matrículas a la derecha */}
          <div className="admin-table-container">
            <div className="admin-search">
              <input 
                type="text" 
                placeholder="Buscar por curso..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="admin-input"
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
                      <div className="admin-actions">
                        <button 
                          className="admin-button edit" 
                          onClick={() => handleEdit(matricula)}
                        >
                          Editar
                        </button>
                        <button 
                          className="admin-button delete" 
                          onClick={() => handleDelete(matricula.id)}
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

export default AdminMat;