import React from 'react';
import '../styles/ErrorPage.css'; 

const ErrorPage = () => {
    return (
        <div className="error-page">
            <h2>Acceso denegado</h2>
            <p>No tienes permiso para acceder a esta página. Por favor, contacta con el administrador si crees que es un error.</p>
            <a href="/">Volver al inicio</a>
        </div>
    );
};

export default ErrorPage;
