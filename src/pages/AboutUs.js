import React from 'react';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const AboutUs = () => {
    return (
      <div className="page-container">
        <Header />
        <main id="content" className="main-content">
          <div className="welcome-container">
            <h1 className="welcome-title">
              Sobre Nosotros
            </h1>

            <p className="welcome-description">
              Este proyecto es mi Trabajo de Fin de Grado, desarrollado con el objetivo de ofrecer una herramienta innovadora que facilite el análisis y la predicción del rendimiento académico tanto para estudiantes como para profesores universitarios. A través de este sistema, mi propósito es proporcionar una solución práctica y eficiente que permita a los usuarios comprender mejor su situación académica y optimizar el seguimiento de su progreso.
              <br/><br/>
              Aunque el proyecto nace como parte de un reto académico, tengo la visión de seguir mejorándolo y ampliando sus funcionalidades en el futuro. Planeo incorporar nuevas características que puedan enriquecer aún más la experiencia de los usuarios, como recomendaciones personalizadas para el aprendizaje y análisis más detallados sobre el rendimiento académico.
              <br/><br/>
              Mi objetivo es convertir esta plataforma en una herramienta aún más completa y útil para el ámbito educativo, contribuyendo a crear un entorno donde los datos guíen el crecimiento académico. Estoy comprometido con la mejora continua de este proyecto, con la esperanza de que, en el futuro, pueda tener un impacto positivo en diversas instituciones educativas y en la formación de futuros profesionales.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
};

export default AboutUs;