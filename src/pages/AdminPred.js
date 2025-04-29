import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';  
import '../styles/Admin.css';  

const AdminPred = () => {
  const [predicciones, setPredicciones] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [currentPrediccion, setCurrentPrediccion] = useState(null);
  const [idMatricula, setIdMatricula] = useState('');
  const [notaPredicha, setNotaPredicha] = useState('');
  const [cluster, setCluster] = useState('');
  const [clusterNumero, setClusterNumero] = useState('');
  const [fecha, setFecha] = useState('');
  const [cursos, setCurso] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    axios.get('http://localhost:5000/admin/predicciones')
      .then(response => setPredicciones(response.data))
      .catch(error => console.error('Error al obtener las predicciones:', error));
    
    axios.get('http://localhost:5000/admin/matriculas')
      .then(response => setMatriculas(response.data))
      .catch(error => console.error('Error al obtener las matrículas:', error));

    axios.get('http://localhost:5000/asignaturas/todos-cursos')
      .then(response => setCurso(response.data))
      .catch(error => console.error('Error al obtener los cursos:', error));
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/predicciones/${id}`)
      .then(() => {
        setPredicciones(predicciones.filter(prediccion => prediccion.id !== id));
      })
      .catch(error => console.error('Error al eliminar la predicción:', error));
  };

  const handleEdit = (prediccion) => {
    setCurrentPrediccion(prediccion);
    setIdMatricula(prediccion.id_matricula);
    setNotaPredicha(prediccion.Nota_predicha);
    setCluster(prediccion.Cluster);
    setClusterNumero(prediccion.Cluster_numero);
    setFecha(prediccion.Fecha);
  };

  const handleSubmit = () => {
    const prediccionData = { 
      id_matricula: idMatricula, 
      Nota_predicha: notaPredicha, 
      Cluster: cluster, 
      Cluster_numero: clusterNumero, 
      Fecha: fecha 
    };

    if (currentPrediccion) {
      axios.put(`http://localhost:5000/admin/predicciones/${currentPrediccion.id}`, prediccionData)
        .then(response => {
          setPredicciones(predicciones.map(prediccion => 
            prediccion.id === currentPrediccion.id ? response.data : prediccion
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar la predicción:', error));
    } else {
      axios.post('http://localhost:5000/admin/predicciones', prediccionData)
        .then(response => {
          setPredicciones([...predicciones, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar la predicción:', error));
    }
  };

  const resetForm = () => {
    setCurrentPrediccion(null);
    setIdMatricula('');
    setNotaPredicha('');
    setCluster('');
    setClusterNumero('');
    setFecha('');
  };

  const filteredPredicciones = predicciones.filter(prediccion => 
    prediccion.Cluster.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPredicciones = filteredPredicciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPredicciones.length / itemsPerPage);

  return (
    <div className="page-container">
      <main id="content" className="admin-container">
        <Header/>
        
        <div className="admin-content-wrapper">
          {/* Formulario a la izquierda */}
          <div className="admin-form">
            <div className="form-header">
              <h2 className="form-title">Gestión de Predicciones</h2>
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
                {Array.isArray(cursos) && cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>{curso.Nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group compact-group">
              <label htmlFor="nota">Nota Predicha</label>
              <input 
                id="nota"
                type="number" 
                value={notaPredicha} 
                onChange={(e) => setNotaPredicha(e.target.value)} 
                placeholder="Ej: 7.5" 
                step="0.1"
                className="form-control compact-input"
              />
            </div>

            <div className="form-group compact-group">
              <label htmlFor="cluster">Cluster</label>
              <input 
                id="cluster"
                type="text" 
                value={cluster} 
                onChange={(e) => setCluster(e.target.value)} 
                placeholder="Ej: Alto rendimiento" 
                className="form-control compact-input"
              />
            </div>

            <div className="form-group compact-group">
              <label htmlFor="cluster-numero">Número de Cluster</label>
              <input 
                id="cluster-numero"
                type="number" 
                value={clusterNumero} 
                onChange={(e) => setClusterNumero(e.target.value)} 
                placeholder="Ej: 1" 
                className="form-control compact-input"
              />
            </div>

            <div className="form-group compact-group">
              <label htmlFor="fecha">Fecha</label>
              <input 
                id="fecha"
                type="date" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                className="form-control compact-input"
              />
            </div>

            <div className="form-actions compact-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>
                {currentPrediccion ? 'Actualizar' : 'Agregar'}
              </button>
              {currentPrediccion && (
                <button className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
          {/* Tabla de predicciones a la derecha */}
          <div className="admin-table-container">
            <div className="admin-search">
              <input 
                type="text" 
                placeholder="Buscar por cluster..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="admin-input"
              />
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nota Predicha</th>
                  <th>Cluster</th>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentPredicciones.map(prediccion => (
                  <tr key={prediccion.id}>
                    <td>{prediccion.id_matricula}</td>
                    <td>{prediccion.Nota_predicha}</td>
                    <td>{prediccion.Cluster}</td>
                    <td>{prediccion.Cluster_numero}</td>
                    <td>{new Date(prediccion.Fecha).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-actions">
                        <button 
                          className="admin-button edit" 
                          onClick={() => handleEdit(prediccion)}
                        >
                          Editar
                        </button>
                        <button 
                          className="admin-button delete" 
                          onClick={() => handleDelete(prediccion.id)}
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

export default AdminPred;