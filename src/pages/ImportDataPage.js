import React, { useState, useEffect } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import '../styles/Common.css';
import axios from 'axios';
import Pautas from '../documents/Pautas.pdf';

const ImportDataPage = () => {
  const [fileUsuarios, setFileUsuarios] = useState(null);
  const [fileAsignatura, setFileAsignatura] = useState("");
  const [fileCurso, setFileCurso] = useState("");
  const [fileNotas, setFileNotas] = useState(null);
  const [fileEventos, setFileEventos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursos, setCursos] = useState([]);

  const handleUsuariosChange = (e) => {
    setFileUsuarios(e.target.files[0]);
  };

  const handleAsignaturaChange = (e) => {
    setFileAsignatura(e.target.value);
  };

  const handleCursoChange = (e) => {
    setFileCurso(e.target.value);
  };

  const handleNotasChange = (e) => {
    setFileNotas(e.target.files[0]);
  };

  const handleEventosChange = (e) => {
    setFileEventos(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileUsuarios || !fileNotas || !fileEventos || fileAsignatura === "" || fileCurso === "") {
      alert("Por favor, selecciona todos los archivos.");
      return;
    }
  
    setShowPopup(true); 
  
    const formData = new FormData();
    formData.append("usuarios", fileUsuarios);
    formData.append("notas", fileNotas);
    formData.append("eventos", fileEventos);
    formData.append("asignatura", fileAsignatura); 
    formData.append("curso", fileCurso); 
  
    try {
      const response = await fetch("http://localhost:5000/scripts/upload-and-run", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert("Error al importar datos.");
      console.error(error);
    } finally {
      setShowPopup(false);
    }
  };

  const handleRunScript = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/scripts/prediccion-script", {
        method: "POST",
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert("Error al ejecutar el script");
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    axios.get(`http://localhost:5000/asignaturas/todas-asignaturas`)
        .then(response => setAsignaturas(response.data))
        .catch(error => console.error('Error cargando asignaturas:', error));

    axios.get('http://localhost:5000/asignaturas/todos-cursos')
        .then(response => setCursos(response.data))
        .catch(error => console.error('Error cargando cursos:', error));
  }, []);

  return (
    <div className="page-container">
      <Header />
      <main id="content" className="main-content">
        <div className="welcome-container" style={{ maxWidth: '800px', padding: '1rem' }}>
          <h1 className="welcome-title">
            Importar Datos
          </h1>

          <p className="welcome-description" style={{ marginBottom: '0.5rem' }}>
            En este apartado, se puede subir información de vuestros alumnos, así como su asignatura, curso y eventos. 
            (En caso de ser alumnos de cursos anteriores, también se pueden subir sus notas finales).
          </p>

          <p className="welcome-description" style={{ margin: '0.5rem 0' }}>
            En el siguiente documento, se explicará el formato de los informes a subir:
          </p>

          <iframe src={Pautas} width="100%" height="500px" className="document-frame" style={{ margin: '0.5rem 0' }}></iframe>

          <div className="download-section" style={{ margin: '1rem 0' }}>
            <p className="section-title" style={{ marginBottom: '0.8rem' }}>
              <strong>Plantillas de los archivos necesarios:</strong>
            </p>
  
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Usuarios:</span>
                <button 
                  className="action-button" 
                  style={{ padding: '0.4rem 0.8rem' }}
                  onClick={() => window.location.href = "Usuarios.xlsx"}
                >
                  Descargar
                </button>
              </div>
    
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Notas:</span>
                <button 
                  className="action-button" 
                  style={{ padding: '0.4rem 0.8rem' }}
                  onClick={() => window.location.href = "Notas.xlsx"}
                >
                  Descargar
                </button>
              </div>
    
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Eventos:</span>
                <button 
                  className="action-button" 
                  style={{ padding: '0.4rem 0.8rem' }}
                  onClick={() => window.location.href = "Eventos.xlsx"}
                >
                  Descargar
                </button>
              </div>
            </div>
          </div>

          <p className="welcome-description" style={{ margin: '0.5rem 0' }}>
            Siguiendo las pautas descritas en el documento anterior, suba los archivos en los siguientes contenedores:
          </p>

          <form onSubmit={handleSubmit} className="upload-form" style={{ margin: '0.5rem auto', padding: '1rem' }}>
            <div className="form-group" style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem' }}>Asignatura</label>
              <select 
                value={fileAsignatura} 
                onChange={handleAsignaturaChange} 
                className="form-select"
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">Selecciona una asignatura</option>
                {asignaturas.map((asignatura) => (
                  <option key={asignatura.id} value={asignatura.Nombre}>{asignatura.Nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem' }}>Curso</label>
              <select 
                value={fileCurso} 
                onChange={handleCursoChange} 
                className="form-select"
                style={{ width: '100%', padding: '0.5rem' }}
              >     
                <option value="">Selecciona un curso</option>
                {cursos.map((curso, index) => (
                  <option key={index} value={curso.Nombre}>{curso.Nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem' }}>Usuarios.xlsx</label>
              <input 
                type="file" 
                onChange={handleUsuariosChange} 
                style={{ width: '100%', padding: '0.3rem' }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem' }}>Notas.xlsx</label>
              <input 
                type="file" 
                onChange={handleNotasChange} 
                style={{ width: '100%', padding: '0.3rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem' }}>Eventos.xlsx</label>
              <input 
                type="file" 
                onChange={handleEventosChange} 
                style={{ width: '100%', padding: '0.3rem' }}
              />
            </div>
            
            <button 
              type="submit" 
              className="action-button" 
              style={{ 
                padding: '0.5rem 1rem', 
                width: '100%',
                margin: '0.5rem 0'
              }}
            >
              Subir Archivos
            </button>
          </form>

          {showPopup && (
            <div className="loading-popup">
              <div className="popup-content">
                <p className="popup-text">Subiendo archivos...</p>
                <p className="popup-subtext">Por favor, espera unos minutos.</p>
              </div>
            </div>
          )}

          <h2 className="section-title" style={{ margin: '1rem 0 0.5rem' }}>Procesar y predecir rendimiento</h2>
          <p className="welcome-description" style={{ margin: '0.5rem 0' }}>
            Ejecutar el algoritmo de predicción para actualizar la base de datos con predicciones actualizadas:
          </p>

          <button
            onClick={handleRunScript}
            className="action-button"
            style={{ padding: '0.5rem 1rem', margin: '0.5rem auto' }}
            disabled={loading}
          >
            {loading ? "Ejecutando..." : "Ejecutar Script"}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImportDataPage;