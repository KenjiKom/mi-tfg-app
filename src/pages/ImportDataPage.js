import React, { useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import '../styles/Common.css';
import { useEffect } from 'react';
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
      setShowPopup(false); // Ocultar el popup cuando termine la operación
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
    <div className="flex flex-col min-h-screen bg-pink-50">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id="content">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">Importar Datos</h1>
        <p>
          En este apartado, se puede subir información de vuestros alumnos, así como su asignatura, curso y eventos. 
          (En caso de ser alumnos de cursos anteriores, también se pueden subir sus notas finales).
        </p>
        <br />
        <p>En el siguiente documento, se explicará el formato de los informes a subir:</p>
        <br />

        <iframe src={Pautas} width="100%" height="600px"></iframe>

        <p><strong>Plantillas de los archivos necesarios:</strong></p>
        <label>Usuarios:</label>
        <button className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors boton-login" onClick={() => window.location.href = "Usuarios.xlsx"}>
          Descargar
        </button>
        <br></br>
        <label>Notas:</label>
        <button className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors boton-login" onClick={() => window.location.href = "Notas.xlsx"}>
          Descargar
        </button>
        <br></br>
        <label>Eventos:</label>
        <button className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors boton-login" onClick={() => window.location.href = "Usuarios.xlsx"}>
          Descargar
        </button>

        <p><br/>Siguiendo las pautas descritas en el documento anterior, suba los archivos en los siguientes contenedores:</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <label>Asignatura</label>
          <select 
            value={fileAsignatura} 
            onChange={handleAsignaturaChange} 
            className="border-2 border-pink-300 px-4 py-2 rounded-md"
          >
            <option value="">Selecciona una asignatura</option> {/* Opción por defecto */}
              {asignaturas.map((asignatura) => (
              <option key={asignatura.id} value={asignatura.Nombre}>{asignatura.Nombre}</option>
              ))}
          </select>

          <label>Curso</label>
          <select 
            value={fileCurso} 
            onChange={handleCursoChange} 
            className="border-2 border-pink-300 px-4 py-2 rounded-md"
          >     
            <option value="">Selecciona un curso</option> {/* Opción por defecto */}
              {cursos.map((curso, index) => (
              <option key={index} value={curso.Nombre}>{curso.Nombre}</option>
              ))}
          </select>
          
          <label>Usuarios.xlsx</label>
          <input type="file" onChange={handleUsuariosChange} className="border-2 border-pink-300 px-4 py-2 rounded-md" />
          
          <label>Notas.xlsx</label>
          <input type="file" onChange={handleNotasChange} className="border-2 border-pink-300 px-4 py-2 rounded-md" />

          <label>Eventos.xlsx</label>
          <input type="file" onChange={handleEventosChange} className="border-2 border-pink-300 px-4 py-2 rounded-md" />
          
          <br /><br />
          <button type="submit" className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors boton-login">
            Subir Archivos
          </button>

        </form>

      {/* Popup de carga */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold">Subiendo archivos...</p>
            <p>Por favor, espera unos minutos.</p>
          </div>
        </div>
      )}

        <h1 className="text-4xl font-bold text-pink-600 mb-4">Procesar y predecir rendimiento</h1>
        <p><br/>Ejecutar el algoritmo de predicción para actualizar la base de datos con predicciones actualizadas:</p>

        <button
          onClick={handleRunScript}
          className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors boton-login"
          disabled={loading}
        >
          {loading ? "Ejecutando..." : "Ejecutar Script"}
        </button>
      </main>
      <Footer />

      
    </div>
  );
};

export default ImportDataPage;