import React, { useEffect, useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/Common.css";
import logo from '../imgs/logo.png';

const MainPage = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const getUserData = () => {
      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");

      setUser(storedUser ? JSON.parse(storedUser) : null);
      setRole(storedRole || "");
    };

    // Ejecutamos al montar
    getUserData();

    // Escuchar cambios en localStorage (para cuando se haga logout)
    const handleStorageChange = () => getUserData();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id = "content">
        
        <h1 className="text-4xl font-bold text-pink-600 mb-4">
          Bienvenid@ a Performy.
        </h1>
        
        <p className="text-lg text-gray-700 max-w-2xl">
        Nos especializamos en proporcionar predicciones académicas precisas y útiles para estudiantes y profesores universitarios. 
        <br/><br/>
        Usando avanzados algoritmos de análisis, nuestra plataforma te permite obtener una visión clara sobre el rendimiento académico y el perfil de cada estudiante. 
        <br/><br/>
        Ya sea que seas estudiante o profesor, nuestra herramienta está diseñada para ofrecerte información valiosa que te ayudará a tomar decisiones informadas sobre tu educación.
        </p>
        <div className="mt-6 flex space-x-4">
    {user ? (
    role === "teacher" ? (
      <>
        <div>
          <p className="text-lg font-semibold text-gray-700">Acciones disponibles para profesores:</p>
          <a
            href="/ProfessorDash"
            className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition"
          >
            Ir al Dash de Profesor
          </a>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">También puedes importar datos de tus estudiantes para actualizar nuestra base de datos:</p>
          <a
            href="/import-data"
            className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition"
          >
            Importar Datos
          </a>
        </div>
      </>
      ) : role === "student" ? (
      <div>
        <p className="text-lg font-semibold text-gray-700">Acciones disponibles para estudiantes:</p>
        <a
          href="/StudentDash"
          className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition"
        >
          Ir al Dash de Estudiante
        </a>
      </div>
      ) : null
        ) : (
        <div>
        <p className="text-lg font-semibold text-gray-700">Por favor, inicia sesión para acceder a las funciones:</p>
        <a
          href="/login"
          className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition"
        >
          Iniciar sesión
        </a>
        </div>
      )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;
