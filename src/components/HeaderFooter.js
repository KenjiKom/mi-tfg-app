import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Common.css";
import logo from '../imgs/logo.png';

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
    localStorage.clear();
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <header id="header" className="text-gray-800 p-4 flex flex-wrap justify-between items-center border-b-2 border-gray-300 shadow-md bg-white opacity-95 fixed top-0 w-full z-50">
      <nav className="flex items-center space-x-4">
      <img src={logo} alt="Logo" className="logo w-10 h-10 object-contain" />
      <ul className="flex flex-wrap space-x-2 sm:space-x-4">
        <li>
          <Link to="/" className="bg-pink-300 px-3 py-1 rounded-lg shadow-md hover:bg-pink-400 transition-colors text-sm sm:text-base">Inicio</Link>
        </li>
        <li>
          <Link to="/about-us" className="bg-pink-300 px-3 py-1 rounded-lg shadow-md hover:bg-pink-400 transition-colors text-sm sm:text-base">Sobre nosotros</Link>
        </li>
        <li>
          <Link to="/faq" className="bg-pink-300 px-3 py-1 rounded-lg shadow-md hover:bg-pink-400 transition-colors text-sm sm:text-base">Preguntas frecuentes</Link>
        </li>
      </ul>
      </nav>

      {/* Contenedor del botón de inicio de sesión o información del usuario */}
      <div className="flex items-center">
        {user ? (
          <div className="flex items-center space-x-2">
            <span className="bg-pink-300 px-4 py-2 rounded-lg shadow-md hover:bg-pink-400 transition-colors">
              Bienvenido, {user.Nombre}
            </span>
            <button
              onClick={handleLogout}
              className="bg-pink-300 text-white px-4 py-2 rounded-lg shadow-md hover:bg-pink-400 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-pink-600 transition-colors">
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
  <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-300 z-50">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-2 p-4">
      <nav>
      <ul className="flex flex-wrap justify-center space-x-4">
        <li>
          <Link to="/" className="bg-pink-300 px-3 py-1 rounded-lg shadow-md hover:bg-pink-400 transition-colors text-sm">
            Inicio
          </Link>
        </li>
        <li>
          <Link to="/about-us" className="bg-pink-300 px-3 py-1 rounded-lg shadow-md hover:bg-pink-400 transition-colors text-sm">
            Sobre nosotros
          </Link>
        </li>
        <li>
          <Link to="/faq" className="bg-pink-300 px-3 py-1 rounded-lg shadow-md hover:bg-pink-400 transition-colors text-sm">
            Preguntas frecuentes
          </Link>
        </li>
      </ul>
    </nav>
    <p className="text-xs text-gray-500">&copy; 2025 Performy. Todos los derechos reservados.</p>
    </div>
  </footer>
  );
};

