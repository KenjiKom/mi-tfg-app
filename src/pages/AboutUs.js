import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const AboutUs = () => {
    return (
        <div className="flex flex-col min-h-screen bg-pink-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-4xl font-bold text-pink-600 mb-4">Bienvenido a Nuestra Página</h1>
          <p className="text-lg text-gray-700 max-w-2xl">
            Explora nuestra plataforma y conoce más sobre nosotros. Si tienes preguntas, revisa nuestra sección de Preguntas Frecuentes.
          </p>
          <div className="mt-6">
            <a href="/about-us" className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition">
              Sobre Nosotros
            </a>
            <a href="/faq" className="ml-4 bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition">
              Preguntas Frecuentes
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  };

export default AboutUs;