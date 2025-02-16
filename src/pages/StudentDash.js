import React from 'react';
import '../styles/StudentDash.css';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";


const StudentDash = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/StudentVisualization'); // Redirige a la vista de predicciones del alumno
  };

  return (
    <div className="student-dashboard">
      <Header />
      <h1>Dashboard del Alumno</h1>
      <p>Bienvenido. Aquí puedes ver tu rendimiento académico:</p>
      <button onClick={handleNavigation}>Ver Predicciones</button>
      <Footer />
    </div>
  );
};

export default StudentDash;
