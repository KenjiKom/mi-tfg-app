import React, { useEffect, useState } from 'react';
import '../styles/StudentVisualization.css';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";

const consejosPorPerfil = {
  'Alto rendimiento': 'Sigue así, mantén tus hábitos de estudio y ayuda a otros compañeros.',
  'Riesgo de fracaso': 'Refuerza tu estudio, busca ayuda con los profesores y organiza mejor tu tiempo.',
  'Desempeño promedio': 'Puedes mejorar, intenta técnicas de estudio más eficientes y participa más en clase.',
  'Nuevo estudiante': 'Adáptate al ritmo de estudio, explora los recursos disponibles y no dudes en preguntar.'
};

const StudentVisualization = () => {
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);

  const alumnoId = localStorage.getItem('alumnoId');

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await axios.get('http://localhost:5000/predicciones/predicciones-alumno', {
          params: { alumnoId }
        });
        if (response.data.length > 0) {
          const { Cluster } = response.data[0]; // Tomamos el primer registro
          setPerfil(Cluster);
        } else {
          setError("No hay datos disponibles para mostrar.");
        }
      } catch (err) {
        setError("Hubo un error al obtener los datos.");
        console.error(err);
      }
    };

    fetchPerfil();
  }, [alumnoId]);

  return (
    <div className="student-dashboard">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id = "content">
      <h1>Tu Perfil Académico</h1>
      {error ? (
        <p>{error}</p>
      ) : perfil ? (
        <div>
          <h2>Perfil: {perfil}</h2>
          <p>{consejosPorPerfil[perfil] || 'Sigue esforzándote y consulta con tu profesor si necesitas ayuda.'}</p>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
      </main>
      <Footer />
    </div>
  );
};

export default StudentVisualization;
