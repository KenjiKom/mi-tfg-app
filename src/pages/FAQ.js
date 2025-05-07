import React from 'react';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const FAQ = () => {
    return (
      <div className="page-container">
        <Header />
        <main id="content" className="main-content">
          <div className="welcome-container">
            <h1 className="welcome-title">
              Preguntas Frecuentes
            </h1>

            <p className="welcome-description">
              <b>¿Esta página web es oficial de la Universidad de Cádiz?</b>
              <br/>
              No. Como se explica en el apartado de "Sobre Nosotros", esto es un proyecto de fin de grado destinado al análisis y estudio pedagógico del rendimiento estudiantil. 
              <br/><br/>
              <b>¿Cómo de fiables son las predicciones?</b>
              <br/>
              Nuestro sistema utiliza el algoritmo <b>Regresor de Bosque Aleatorio</b>, un modelo avanzado de aprendizaje automático que combina múltiples árboles de decisión para predecir los pefiles finales de los alumnos con alta precisión
              <br/><br/>
              <b>¿Como accedo a las funciones que brinda la página?</b>
              <br/>
              Debes iniciar sesión con el mismo perfil que utilizas para conectarte al Campus Virtual. Si no te permite iniciar sesión, seguramente sea porque ningun profesor te ha registrado todavia en la página.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
};

export default FAQ;