import React, { useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import '../styles/Common.css';
import Pautas from '../documents/Pautas.pdf';

const ImportDataPage = () => {
  const [fileUsuarios, setFileUsuarios] = useState(null);
  const [fileAsignaturas, setFileAsignaturas] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUsuariosChange = (e) => {
    setFileUsuarios(e.target.files[0]);
  };

  const handleAsignaturasChange = (e) => {
    setFileAsignaturas(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileUsuarios || !fileAsignaturas) {
      alert("Por favor, selecciona ambos archivos.");
      return;
    }

    const formData = new FormData();
    formData.append("usuarios", fileUsuarios);
    formData.append("asignaturas", fileAsignaturas);

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

        <p><br/>Siguiendo las pautas descritas en el documento anterior, suba los archivos en el siguiente contenedor:</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label>Usuarios.xlsx</label>
          <input type="file" onChange={handleUsuariosChange} className="border-2 border-pink-300 px-4 py-2 rounded-md" />
          
          <label>Asignatura.xlsx</label>
          <input type="file" onChange={handleAsignaturasChange} className="border-2 border-pink-300 px-4 py-2 rounded-md" />
          <br /><br />

          <button type="submit" className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors boton-login">
            Subir Archivos
          </button>
        </form>

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
