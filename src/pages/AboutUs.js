import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';
import Uca from '../imgs/uca.png';

const AboutUs = () => {
    return (
        <div className="flex flex-col min-h-screen bg-pink-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id = "content">
          <h1 className="text-4xl font-bold text-pink-600 mb-4">Sobre Nosotros.</h1>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-4">
          Este proyecto es mi Trabajo de Fin de Grado, desarrollado con el objetivo de ofrecer una herramienta innovadora que facilite el análisis y la predicción del rendimiento académico tanto para estudiantes como para profesores universitarios. A través de este sistema, mi propósito es proporcionar una solución práctica y eficiente que permita a los usuarios comprender mejor su situación académica y optimizar el seguimiento de su progreso.
          <br/><br/>
          Aunque el proyecto nace como parte de un reto académico, tengo la visión de seguir mejorándolo y ampliando sus funcionalidades en el futuro. Planeo incorporar nuevas características que puedan enriquecer aún más la experiencia de los usuarios, como recomendaciones personalizadas para el aprendizaje y análisis más detallados sobre el rendimiento académico.
          <br/><br/>
          Mi objetivo es convertir esta plataforma en una herramienta aún más completa y útil para el ámbito educativo, contribuyendo a crear un entorno donde los datos guíen el crecimiento académico. Estoy comprometido con la mejora continua de este proyecto, con la esperanza de que, en el futuro, pueda tener un impacto positivo en diversas instituciones educativas y en la formación de futuros profesionales.
          </p>
          <img src={Uca} alt="Uca" className="uca"/>
        </main>
        <Footer />
      </div>
    );
  };

export default AboutUs;