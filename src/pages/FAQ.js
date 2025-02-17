import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const FAQ = () => {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id = "content">
          <h1 className="text-4xl font-bold text-pink-600 mb-4">Preguntas Frecuentes.</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-4">
          <b>¿Esta página web es oficial de la Universidad de Cádiz?</b>
          <br/>
          No. Como se explica en el apartado de "Sobre Nosotros", esto es un proyecto de fin de grado destinado al análisis y estudio pedagógico del rendimiento estudiantil. 
          <br/><br/>
          <b>¿Cómo de fiables son las predicciones?</b>
          <br/>
          La predicción del rendimiento se basa primero en un algoritmo K-Medias, que divide en perfiles (clusters de datos) a los estudiantes de cursos anteriores. Por otra parte, un algoritmo de Bosque Aleatorio es entrenado con los resultados del algoritmo anterior, para poder predecir con alta exactitud el rendimiento de los estudiantes actuales.
          <br/><br/>
          <b>¿Como accedo a las funciones que brinda la página?</b>
          <br/>
          Debes iniciar sesión con el mismo perfil que utilizas para conectarte al Campus Virtual. Si no te permite iniciar sesión, seguramente sea porque ningun profesor te ha registrado todavia en la página. 
          </p>
        </main>
        <Footer />
      </div>
    );
  };

export default FAQ;