import React, { useEffect, useState } from 'react';
import '../styles/ProfessorVisualization.css';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { Header, Footer } from "../components/HeaderFooter.js";

const ProfessorVisualization = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Número de alumnos por página

  const profesorId = localStorage.getItem('id');

  // Obtener las asignaturas del profesor
  useEffect(() => {
    if (!profesorId) {
      setError("No se encontró el ID del profesor");
      return;
    }

    const fetchAsignaturas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/asignaturas/asignaturas-profesor', {
          params: { profesorId }
        });
        setAsignaturas(response.data);
      } catch (err) {
        setError("Hubo un error al obtener las asignaturas");
        console.error(err);
      }
    };

    fetchAsignaturas();
  }, [profesorId]);

  // Obtener los cursos de la asignatura seleccionada
  const handleAsignaturaChange = async (asignatura) => {
    setSelectedAsignatura(asignatura);
    setSelectedCurso(null);
    setAlumnos([]);

    try {
      const response = await axios.get('http://localhost:5000/asignaturas/cursos', {
        params: { profesorId, asignatura }
      });
      setCursos(response.data);
    } catch (err) {
      setError("Hubo un error al obtener los cursos");
      console.error(err);
    }
  };

  // Obtener los alumnos del curso seleccionado
  const handleCursoChange = async (curso) => {
    setSelectedCurso(curso);
    setCurrentPage(1);

    try {
      const response = await axios.get('http://localhost:5000/predicciones/alumnos', {
        params: { profesorId, asignatura: selectedAsignatura, curso }
      });
      setAlumnos(response.data);
    } catch (err) {
      setError("Hubo un error al obtener los alumnos");
      console.error(err);
    }
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlumnos = alumnos.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < Math.ceil(alumnos.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Datos para el gráfico de barras
  const barChartData = {
    labels: alumnos.map(alumno => alumno.Nombre),
    datasets: [
      {
        label: 'Nota Predicha',
        data: alumnos.map(alumno => alumno.Nota_predicha),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Opciones para el gráfico
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10, // Ajusta el máximo según tus necesidades
      },
    },
  };

  return (
    <div className="teacher-dashboard">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id="content">
        <h1>Visualización de Alumnos y Predicciones</h1>
        {error && <p className="error">{error}</p>}

        {/* Filtros de asignatura */}
        <div className="course-filters">
          {asignaturas.map((asignatura) => (
            <button
              key={asignatura.Nombre}
              className={`course-button ${selectedAsignatura === asignatura.Nombre ? 'active' : ''}`}
              onClick={() => handleAsignaturaChange(asignatura.Nombre)}
            >
              {asignatura.Nombre}
            </button>
          ))}
        </div>

        {/* Filtros de curso */}
        {selectedAsignatura && (
          <div className="course-filters">
            {cursos.map((curso) => (
              <button
                key={curso.Curso}
                className={`course-button ${selectedCurso === curso.Curso ? 'active' : ''}`}
                onClick={() => handleCursoChange(curso.Curso)}
              >
                {curso.Curso}
              </button>
            ))}
          </div>
        )}

        {/* Gráfico de barras */}
        {selectedCurso && (
          <div className="chart-container" style={{ height: '300px', width: '80%' }}>
            <h2>Notas Predichas de los Alumnos</h2>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        )}
        <br/><br/>
        {/* Tabla de alumnos */}
        {selectedCurso && (
          <div className="alumnos-table">
            <h2>Alumnos del curso {selectedCurso}</h2>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Nota Predicha</th>
                  <th>Perfil</th>
                </tr>
              </thead>
              <tbody>
                {currentAlumnos.map((alumno) => (
                  <tr key={alumno.id}>
                    <td>{alumno.Nombre}</td>
                    <td>{alumno.Nota_predicha}</td>
                    <td>{alumno.Cluster}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación con flechas */}
            <div className="pagination-controls">
              <button onClick={prevPage} disabled={currentPage === 1}>
                &larr; Anterior
              </button>
              <span>{currentPage}</span>
              <button
                onClick={nextPage}
                disabled={currentPage === Math.ceil(alumnos.length / itemsPerPage)}
              >
                Siguiente &rarr;
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProfessorVisualization;