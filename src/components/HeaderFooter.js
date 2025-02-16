import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Common.css";

export const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Convertimos de string a objeto
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/"); // Redirigir a la página de inicio de sesión
  };

  return (
    <header className="bg-pink-100 text-gray-800 p-4 flex justify-between items-center border-b-2 border-gray-300 shadow-md">
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="bg-pink-300 px-4 py-2 rounded-lg shadow-md hover:bg-pink-400 transition-colors">Inicio</Link>
          </li>
          <li>
            <Link to="/about-us" className="bg-pink-300 px-4 py-2 rounded-lg shadow-md hover:bg-pink-400 transition-colors">Sobre Nosotros</Link>
          </li>
          <li>
            <Link to="/faq" className="bg-pink-300 px-4 py-2 rounded-lg shadow-md hover:bg-pink-400 transition-colors">Preguntas Frecuentes</Link>
          </li>
        </ul>
      </nav>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-gray-800 font-semibold">Bienvenido, {user.Nombre}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-pink-600 transition-colors">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-pink-100 text-gray-800 p-4 text-center border-t-2 border-gray-300 shadow-md">
      <nav>
        <ul className="flex justify-center space-x-6">
          <li>
            <Link to="/" className="hover:text-pink-500 transition-colors">Inicio</Link>
          </li>
          <li>
            <Link to="/about-us" className="hover:text-pink-500 transition-colors">Sobre Nosotros</Link>
          </li>
          <li>
            <Link to="/faq" className="hover:text-pink-500 transition-colors">Preguntas Frecuentes</Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
};
