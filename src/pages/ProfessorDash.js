import React from 'react';
import '../styles/Common.css';
import '../styles/ProfessorVisualization.css'
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";

const ProfessorDash = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/ProfessorVisualization');
  };

  return (
    <div className="main-content">
    <div>
      <Header />
      <main className="welcome-container" id = "content">
      <h1>Dashboard para profesores</h1>
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
