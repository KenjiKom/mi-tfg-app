import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const FAQ = () => {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow p-4">{/* Contenido principal vacío */}</main>
        Preguntas frecuentas
        <Footer />
      </div>
    );
  };

export default FAQ;