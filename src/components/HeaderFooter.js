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
    <header id="header" className="text-gray-800 p-4 flex justify-between items-center border-b-2 border-gray-300 shadow-md bg-white opacity-95 fixed top-0 w-full z-50">
      
      <nav>
        <ul className="flex space-x-4" class="breadcrumb">
        <img src={logo} alt="Logo" className="logo"/>
          
          <li>
            <Link to="/" className="bg-pink-300 px-4 py-2 rounded-lg shadow-md hover:bg-pink-400 transition-colors">Inicio</Link>
          </li>
          
          <li>
            <Link to="/about-us" className="bg-pink-300 px-4 py-2 rounded-lg shadow-md hover:bg-pink-400 transition-colors">Sobre nosotros</Link>
          </li>
          <li>
            <Link to="/faq" className="bg-pink-300 px-4 py-2 rounded-lg shadow-md hover:bg-pink-400 transition-colors">Preguntas frecuentes</Link>
          </li>
          <li>
          {user ? (
          <>
            <span className="bg-pink-300 px-4 py-2 rounded-lg shadow-md hover:bg-pink-400 transition-colors">Bienvenido, {user.Nombre}   </span>
            <button
              onClick={handleLogout}
              className="bg-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-400 transition-colors"
              class = "boton-login"
            >
              Cerrar sesión
            </button>

          </>
        ) : (
          <Link to="/login" className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-pink-600 transition-colors">
            Iniciar sesión
          </Link>
        )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer id="footer" className="text-gray-800 p-4 text-center border-t-2 border-gray-300 shadow-md bg-aliceblue fixed bottom-0 w-full" class = "breadcrumb">
      <nav>
        <ul className="flex justify-center space-x-6">
          <li>
            <Link to="/" className="hover:text-pink-500 transition-colors">Inicio</Link>
          </li>
          <li>
            <Link to="/about-us" className="hover:text-pink-500 transition-colors">Sobre nosotros</Link>
          </li>
          <li>
            <Link to="/faq" className="hover:text-pink-500 transition-colors">Preguntas frecuentes</Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
};
