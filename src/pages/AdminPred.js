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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:5000/admin/predicciones')
      .then(response => setPredicciones(response.data))
      .catch(error => console.error('Error al obtener las predicciones:', error));
    
    axios.get('http://localhost:5000/admin/matriculas')
      .then(response => setMatriculas(response.data))
      .catch(error => console.error('Error al obtener las matrículas:', error));
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
    const prediccionData = { id_matricula: idMatricula, Nota_predicha: notaPredicha, Cluster: cluster, Cluster_numero: clusterNumero, Fecha: fecha };

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
    <main id="content" className="admin-container">
      <Header/>
      {/* Formulario a la izquierda */}
      <div className="admin-form">
        <h2>Gestión de Predicciones</h2>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Buscar por cluster" 
        />
        <select value={idMatricula} onChange={(e) => setIdMatricula(e.target.value)}>
          <option value="">Seleccionar Matrícula</option>
          {matriculas.map(matricula => (
            <option key={matricula.id} value={matricula.id}>{matricula.Curso}</option>
          ))}
        </select>
        <input 
          type="number" 
          value={notaPredicha} 
          onChange={(e) => setNotaPredicha(e.target.value)} 
          placeholder="Nota Predicha" 
          step="0.1" 
        />
        <input 
          type="text" 
          value={cluster} 
          onChange={(e) => setCluster(e.target.value)} 
          placeholder="Cluster" 
        />
        <input 
          type="number" 
          value={clusterNumero} 
          onChange={(e) => setClusterNumero(e.target.value)} 
          placeholder="Número de Cluster" 
        />
        <input 
          type="date" 
          value={fecha} 
          onChange={(e) => setFecha(e.target.value)} 
        />
        <button className="admin-button" onClick={handleSubmit}>
          {currentPrediccion ? 'Actualizar' : 'Agregar'}
        </button>
      </div>

      {/* Tabla de predicciones a la derecha */}
      <div className="admin-table-container">
        <div className="admin-search">
          <input 
            type="text" 
            placeholder="Buscar predicción..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
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
                <td>{prediccion.Fecha}</td>
                <td>
                  <button className="admin-button" onClick={() => handleEdit(prediccion)}>Editar</button>
                  <button className="admin-button" onClick={() => handleDelete(prediccion.id)}>Eliminar</button>
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

export default AdminPred;