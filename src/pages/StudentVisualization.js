import React, { useEffect, useState } from 'react';
import '../styles/StudentVisualization.css';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";

const consejosPorPerfil = {
  'Sobresaliente': 'Sigue así, mantén tus hábitos de estudio y ayuda a otros compañeros.',
  'Riesgo de fracaso': 'Refuerza tu estudio, busca ayuda con los profesores y organiza mejor tu tiempo.',
  'Notable': 'Puedes mejorar, intenta técnicas de estudio más eficientes y participa más en clase.',
  'Bajo / Nuevo Estudiante': 'Adáptate al ritmo de estudio, explora los recursos disponibles y no dudes en preguntar.'
};

const StudentVisualization = () => {
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);
  const [predicciones, setPredicciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState(null);

  const alumnoId = localStorage.getItem('id');

  useEffect(() => {
    const fetchPredicciones = async () => {
      try {
        const response = await axios.get('http://localhost:5000/predicciones/predicciones-alumno', {
          params: { alumnoId }
        });

        if (response.data.length > 0) {
          setPredicciones(response.data);

          // Extraer asignaturas y cursos únicos
          const asignaturasUnicas = [...new Set(response.data.map(item => item.Asignatura))];
          const cursosUnicos = [...new Set(response.data.map(item => item.Curso))];

          setAsignaturas(asignaturasUnicas);
          setCursos(cursosUnicos);
        } else {
          setError("No hay datos disponibles para mostrar.");
        }
      } catch (err) {
        setError("Hubo un error al obtener los datos.");
        console.error(err);
      }
    };

    fetchPredicciones();
  }, [alumnoId]);

  // Filtrar predicciones por asignatura y curso
  const filteredPredicciones = predicciones.filter(prediccion => {
    return (
      (!selectedAsignatura || prediccion.Asignatura === selectedAsignatura) &&
      (!selectedCurso || prediccion.Curso === selectedCurso)
    );
  });

  // Actualizar el perfil cuando se selecciona un curso
  useEffect(() => {
    if (selectedCurso && filteredPredicciones.length > 0) {
      setPerfil(filteredPredicciones[0].Cluster); // Tomamos el perfil del primer registro
    } else {
      setPerfil(null); // Resetear el perfil si no hay curso seleccionado
    }
  }, [selectedCurso, filteredPredicciones]);

  return (
    <div className="student-dashboard">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id="content">
        <h1>Visualización de Predicciones</h1>
        {error && <p className="error">{error}</p>}

        {/* Filtros de asignatura y curso (arriba del todo) */}
        <div className="course-filters">
          {asignaturas.map((asignatura) => (
            <button
              key={asignatura}
              className={`course-button ${selectedAsignatura === asignatura ? 'active' : ''}`}
              onClick={() => setSelectedAsignatura(asignatura)}
            >
              {asignatura}
            </button>
          ))}
        </div>

        {selectedAsignatura && (
          <div className="course-filters">
            {cursos.map((curso) => (
              <button
                key={curso}
                className={`course-button ${selectedCurso === curso ? 'active' : ''}`}
                onClick={() => setSelectedCurso(curso)}
              >
                {curso}
              </button>
            ))}
          </div>
        )}

        {/* Perfil académico (oculto inicialmente) */}
        {selectedCurso && perfil && (
          <div className="student-profile">
            <h2>Tu Perfil Académico</h2>
            <p><strong>Perfil:</strong> {perfil}</p>
            <p>{consejosPorPerfil[perfil] || 'Sigue esforzándote y consulta con tu profesor si necesitas ayuda.'}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudentVisualization;