import React from 'react';
import '../styles/Common.css';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";


const StudentDash = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/StudentVisualization');
  };

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id = "content">
      <h1>Dashboard del Alumno</h1>
      <p>Bienvenido. Aquí puedes ver tu rendimiento académico:</p>
      <button 
        onClick={handleNavigation} 
        className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors"
        class = "boton-login"
      >
        Ver Rendimiento
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDash;
