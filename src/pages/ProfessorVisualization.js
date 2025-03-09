import React, { useEffect, useState } from 'react';
import '../styles/ProfessorVisualization.css';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { Header, Footer } from "../components/HeaderFooter.js";
import { Pie } from 'react-chartjs-2';

const ProfessorVisualization = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [selectedNota, setSelectedNota] = useState(null);
  const [selectedPerfil, setSelectedPerfil] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Número de alumnos por página

  const profesorId = localStorage.getItem('id');

  // Obtener los alumnos y extraer asignaturas y cursos
  useEffect(() => {
    if (!profesorId) {
      setError("No se encontró el ID del profesor");
      return;
    }

    const fetchAlumnos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/predicciones/alumnos', {
          params: { profesorId }
        });

        // Extraer asignaturas y cursos únicos
        const asignaturasUnicas = [...new Set(response.data.map(item => item.Asignatura))];
        const cursosUnicos = [...new Set(response.data.map(item => item.Curso))];

        setAlumnos(response.data);
        setAsignaturas(asignaturasUnicas);
        setCursos(cursosUnicos);
      } catch (err) {
        setError("Hubo un error al obtener los alumnos");
        console.error(err);
      }
    };

    fetchAlumnos();
  }, [profesorId]);

  // Filtrar alumnos por asignatura, curso, nota seleccionada y perfil seleccionado
  const filteredAlumnos = alumnos.filter(alumno => {
    const nota = Math.round(alumno.Nota_predicha / 10);
    return (
      (!selectedAsignatura || alumno.Asignatura === selectedAsignatura) &&
      (!selectedCurso || alumno.Curso === selectedCurso) &&
      (selectedNota === null || nota === selectedNota) &&
      (!selectedPerfil || alumno.Cluster === selectedPerfil)
    );
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlumnos = filteredAlumnos.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredAlumnos.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Gráfico de barras para notas predichas
  const notaCounts = Array(11).fill(0);
  filteredAlumnos.forEach(alumno => {
    const nota = Math.round(alumno.Nota_predicha / 10);;
    if (nota >= 0 && nota <= 10) {
      notaCounts[nota] += 1;
    }
  });

  const barChartData = {
    labels: Array.from({ length: 11 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'Cantidad de Alumnos',
        data: notaCounts,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && elements[0].index !== undefined) {
        const index = elements[0].index;
        setSelectedNota(index ?? -1); // Asegurar que index=0 no se ignora
      } else {
        setSelectedNota(null);
      }
    },
  };
  

  // Gráfico de barras para perfiles
  const perfilCounts = {};
  filteredAlumnos.forEach(alumno => {
    const perfil = alumno.Cluster;
    if (perfil) {
      perfilCounts[perfil] = (perfilCounts[perfil] || 0) + 1;
    }
  });

  const perfilChartData = {
    labels: Object.keys(perfilCounts),
    datasets: [
      {
        label: 'Cantidad de Alumnos por Perfil',
        data: Object.values(perfilCounts),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const perfilChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const perfil = Object.keys(perfilCounts)[index];
        setSelectedPerfil(perfil);
      } else {
        setSelectedPerfil(null);
      }
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
              key={asignatura}
              className={`course-button ${selectedAsignatura === asignatura ? 'active' : ''}`}
              onClick={() => setSelectedAsignatura(asignatura)}
            >
              {asignatura}
            </button>
          ))}
        </div>

        {/* Filtros de curso */}
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

        {/* Gráficos de barras */}
        {selectedCurso && (
  <div className="chart-container" style={{ display: 'flex', justifyContent: 'space-between', width: '80%' }}>
    <div style={{ height: '300px', width: '48%' }}>
      <h2>Notas Reales/Predichas</h2>
      <Bar data={barChartData} options={barChartOptions} />
      {selectedNota !== null && (
        <button onClick={() => setSelectedNota(null)}>Resetear Filtro de Nota</button>
      )}
    </div>
    <div style={{ height: '300px', width: '48%' }}>
      <h2>Perfiles de los Alumnos</h2>
      <Pie
        data={{
          labels: perfilChartData.labels,
          datasets: [
            {
              data: perfilChartData.datasets[0].data,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
              ],
            },
          ],
        }}
        options={{
          plugins: {
            legend: {
              display: true,
              position: 'right',
            },
          },
          onClick: (evt, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              setSelectedPerfil(perfilChartData.labels[index]);
                }
              },
            }}
            />
              {selectedPerfil !== null && (
                <button onClick={() => setSelectedPerfil(null)}>Resetear Filtro de Perfil</button>
              )}
            </div>
          </div>
        )}
        <br/><br/><br/><br/><br/><br/>
        {/* Tabla de alumnos */}
        {selectedCurso && (
          <div className="alumnos-table">
            <h2>Alumnos del curso {selectedCurso}</h2>
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Nota Predicha</th>
                  <th>Perfil</th>
                </tr>
              </thead>
              <tbody>
                {currentAlumnos.map((alumno) => (
                  <tr key={alumno.id}>
                    <td>{alumno.Alumno}</td>
                    <td>{(alumno.Nota_predicha / 10).toFixed(2)}</td>
                    <td>{alumno.Cluster}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br/><br/>
            {/* Paginación con flechas */}
            <div className="pagination-controls">
              <button onClick={prevPage} disabled={currentPage === 1}>
                &larr; Anterior
              </button>
              <span>{currentPage}</span>
              <button
                onClick={nextPage}
                disabled={currentPage === Math.ceil(filteredAlumnos.length / itemsPerPage)}
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