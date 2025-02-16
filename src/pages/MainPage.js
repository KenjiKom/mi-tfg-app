import React, { useEffect, useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/Common.css";

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
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">
          Bienvenido a Nuestra Página
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl">
          Explora nuestra plataforma y conoce más sobre nosotros. Si tienes preguntas, revisa nuestra sección de Preguntas Frecuentes.
        </p>
        <div className="mt-6 flex space-x-4">
          {user ? (
            role === "teacher" ? (
              <>
                <a
                  href="/ProfessorDash"
                  className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition"
                >
                  Ir al Dash de Profesor
                </a>
                <a
                  href="/import-data"
                  className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition"
                >
                  Importar Datos
                </a>
              </>
            ) : role === "student" ? (
              <a
                href="/StudentDash"
                className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition"
              >
                Ir al Dash de Estudiante
              </a>
            ) : null
          ) : (
            <a
              href="/login"
              className="bg-pink-300 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-400 transition"
            >
              Iniciar sesión
            </a>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;
