import React from 'react';
import '../styles/Common.css';
import '../styles/ProfessorVisualization.css'
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";
import Perfiles from "../documents/Perfiles Académicos.pdf";

const ProfessorDash = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/ProfessorVisualization');
  };

  return (
    <div className="page-container">
    <div>
      <Header />
      <main className="welcome-container" id = "content">
      <h1>Dashboard para profesores</h1>
      <iframe src={Perfiles} width="100%" height="500px" className="document-frame" style={{ margin: '0.5rem 0' }}></iframe>
      <p>Bienvenido. En esta página podrás visualizar el rendimiento percibido del alumnado:</p>
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
    </div>
  );
};

export default ProfessorDash;
