import React, { useEffect, useState } from 'react';
import '../styles/StudentVisualization.css';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";

/*const consejosPorPerfil = {
  'Baja nota, muchos eventos' : '',
  'Baja nota, pocos eventos y baja constancia' : '',
  'Alta nota, pocos eventos y baja constancia' : '',
  'Alta nota, pocos eventos y mucha constancia' : '',
  'Alta nota, muchos eventos' : 'Sigue así.',
  'Baja nota, pocos eventos y mucha constancia' : ''
};*/

const StudentVisualization = () => {
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);
  const [predicciones, setPredicciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [eventos, setEventos] = useState([]); 

  const alumnoId = localStorage.getItem('id');
  const alumnoName = localStorage.getItem('name');

  useEffect(() => {
    const fetchPredicciones = async () => {
      try {
        const response = await axios.get('http://localhost:5000/predicciones/predicciones-alumno', {
          params: { alumnoId }
        });

        if (response.data.length > 0) {
          setPredicciones(response.data);

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

  useEffect(() => {
    const fetchEventos = async () => {
      if (selectedCurso && selectedAsignatura && alumnoName) {
        try {
          const response = await axios.get('http://localhost:5000/predicciones/detalle_alumno', {
            params: {
              alumno: alumnoName,
              asignatura: selectedAsignatura, 
              curso: selectedCurso 
            }
          });
          setEventos(response.data.Eventos || []);
        } catch (err) {
          console.error("Error al obtener los eventos:", err);
          setEventos([]); 
        }
      }
    };

    fetchEventos();
  }, [selectedCurso, selectedAsignatura, alumnoName]); 

  // Filtrar predicciones por asignatura y curso
  const filteredPredicciones = predicciones.filter(prediccion => {
    return (
      (!selectedAsignatura || prediccion.Asignatura === selectedAsignatura) &&
      (!selectedCurso || prediccion.Curso === selectedCurso)
    );
  });


  useEffect(() => {
    if (selectedCurso && filteredPredicciones.length > 0) {
      setPerfil(filteredPredicciones[0].Cluster); 
    } else {
      setPerfil(null); 
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

        {/* Perfil académico y eventos (oculto inicialmente) */}
        {selectedCurso && perfil && (
          <div className="student-profile">
            <h2>Tu Perfil Académico</h2>
            <p><strong>Perfil:</strong> {perfil}</p>
            {/*<p>{consejosPorPerfil[perfil] || 'Sigue esforzándote y consulta con tu profesor si necesitas ayuda.'}</p>*/}
            <p>Para esta predicción, nuestro algoritmo ha tenido en cuenta: <br></br> 
            el número de actividades relevantes con la asignatura en el campus virtual y la constancia de estas interacciones a lo largo del curso.</p>
            {/* Mostrar eventos */}
            <p><strong>Número de actividades relevantes:</strong> {eventos.length}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudentVisualization;