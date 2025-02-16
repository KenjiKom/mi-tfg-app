import React from 'react';
import '../styles/ProfessorDash.css';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";

const ProfessorDash = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/ProfessorVisualization');
  };

  return (
    <div className="teacher-dashboard">
      <Header />
      <h1>Dashboard para profesores</h1>
      <p>Bienvenido. En esta página podrás visualizar el rendimiento percibido del alumnado:</p>
      <button onClick={handleNavigation}>Ver Rendimiento</button>
      <Footer />
    </div>
  );
};

export default ProfessorDash;
