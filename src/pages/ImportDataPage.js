import React, { useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";

const ImportDataPage = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Por favor, selecciona un archivo");
      return;
    }

    // Aquí podrías manejar la lógica para enviar el archivo al servidor o procesarlo
    console.log("Archivo a importar:", file);
    alert("Archivo importado correctamente");
  };

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">Importar Datos</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="border-2 border-pink-300 px-4 py-2 rounded-md"
          />
          <button
            type="submit"
            className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition"
          >
            Subir Archivo
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default ImportDataPage;
