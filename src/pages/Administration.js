import React from 'react';
import '../styles/Common.css';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";

const Administration = () => {
  const navigate = useNavigate();

  const handleNavigationUser = () => {
    navigate('/AdminUser');
  };

  const handleNavigationAsig = () => {
    navigate('/AdminAsig');
  };

  const handleNavigationCourse = () => {
    navigate('/AdminCourse');
  };

  const handleNavigationMat = () => {
    navigate('/AdminMat');
  };

  const handleNavigationEvent = () => {
    navigate('/AdminEvent');
  };
  
  const handleNavigationPred = () => {
    navigate('/AdminPred');
  };

  return (
    <div className="main-content">
    <div>
      <Header />
      <main className="welcome-container" id = "content">
      <h1>CRUD para administradores</h1>
      <p>Bienvenido. En esta página podrás gestionar la información alojada en nuestra base de datos. ¿Qué desea consultar?</p>

      <button 
        onClick={handleNavigationUser} 
        className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors"
        class = "boton-login"
      >
        Usuarios
      </button>
      
      <button 
        onClick={handleNavigationAsig} 
        className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors"
        class = "boton-login"
      >
        Asignaturas
      </button>

      <button 
        onClick={handleNavigationCourse} 
        className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors"
        class = "boton-login"
      >
        Cursos
      </button>

      <button 
        onClick={handleNavigationMat} 
        className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors"
        class = "boton-login"
      >
        Matrículas
      </button>

      <button 
        onClick={handleNavigationEvent} 
        className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors"
        class = "boton-login"
      >
        Eventos
      </button>

      <button 
        onClick={handleNavigationPred} 
        className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors"
        class = "boton-login"
      >
        Predicciones
      </button>
      </main>
      <Footer />
    </div>
    </div>
  );
};

export default Administration;
