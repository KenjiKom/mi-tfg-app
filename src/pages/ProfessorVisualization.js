import React, { useEffect, useState } from 'react';
import '../styles/ProfessorVisualization.css';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto'; // Necesario para Chart.js

const ProfessorVisualization = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [chartDataNotas, setChartDataNotas] = useState({});
  const [chartDataPerfiles, setChartDataPerfiles] = useState({});
  const [filteredAlumnos, setFilteredAlumnos] = useState([]);
  const [selectedNoteRange, setSelectedNoteRange] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Número de elementos por página

  // Obtener el id del profesor desde el localStorage
  const profesorId = localStorage.getItem('profesorId');

  // Función para aplicar todos los filtros
  const applyFilters = () => {
    let filtered = alumnos;

    // Aplicar filtro de curso
    if (selectedCurso) {
      filtered = filtered.filter(alumno => alumno.Curso === selectedCurso);
    }

    // Aplicar filtro de nota
    if (selectedNoteRange !== null) {
      filtered = filtered.filter(alumno => Math.floor(alumno.Nota_predicha) === selectedNoteRange);
    }

    // Aplicar filtro de perfil
    if (selectedProfile !== null) {
      filtered = filtered.filter(alumno => alumno.Cluster === selectedProfile);
    }

    setFilteredAlumnos(filtered);
  };

  // Efecto para aplicar los filtros cuando cambia algún filtro
  useEffect(() => {
    applyFilters();
  }, [selectedCurso, selectedNoteRange, selectedProfile]);

  // Obtener los alumnos al cargar el componente
  useEffect(() => {
    if (!profesorId) {
      setError("No se encontró el ID del profesor");
      return;
    }

    const fetchAlumnos = async () => {
      try {
        // Hacer la solicitud al backend para obtener los alumnos
        const response = await axios.get('http://localhost:5000/predicciones/alumnos', {
          params: { profesorId }
        });
        setAlumnos(response.data);
        setFilteredAlumnos(response.data); // Iniciar con todos los alumnos
      } catch (err) {
        setError("Hubo un error al obtener los alumnos");
        console.error(err);
      }
    };

    fetchAlumnos();
  }, [profesorId]);

  // Filtrar por curso
  const cursos = [...new Set(alumnos.map(alumno => alumno.Curso))]; // Extraemos los cursos únicos

  const handleCursoChange = (curso) => {
    setSelectedCurso(curso);
    setSelectedNoteRange(null); // Limpiar filtro de nota
    setSelectedProfile(null); // Limpiar filtro de perfil
    setCurrentPage(1); // Reiniciar a la primera página
  };

  // Generar datos para la gráfica de notas
  const generateChartDataNotas = (data) => {
    const notas = data.map(alumno => Math.floor(alumno.Nota_predicha)); // Redondeamos las notas a enteros
    const conteoNotas = Array(11).fill(0); // De 0 a 10 (dividiendo la nota por 10)

    // Contamos cuántos alumnos hay en cada rango de nota
    notas.forEach(nota => {
      conteoNotas[nota] += 1;
    });

    setChartDataNotas({
      labels: Array.from({ length: 11 }, (_, i) => i), // Rango de 0 a 10
      datasets: [
        {
          label: 'Distribución de Notas',
          data: conteoNotas,
          borderColor: 'rgba(75,192,192,1)',
          fill: false,
          tension: 0.1,
        }
      ],
      options: {
        scales: {
          y: {
            min: 0,
            max: 10, // Mantener el eje Y constante de 0 a 10
          }
        }
      }
    });
  };

  // Generar datos para la gráfica por perfiles
  const generateChartDataPerfiles = (data) => {
    const perfiles = [...new Set(data.map(alumno => alumno.Cluster))]; // Tomamos todos los perfiles únicos
    const conteoPerfiles = perfiles.map((perfil) => {
      const alumnosPorPerfil = data.filter(alumno => alumno.Cluster === perfil);
      return alumnosPorPerfil.length;
    });

    // Solo mantenemos los primeros 4 perfiles
    const perfilesLimitados = perfiles.slice(0, 4);
    const conteoLimitado = conteoPerfiles.slice(0, 4);

    setChartDataPerfiles({
      labels: perfilesLimitados, // Usamos los perfiles como etiquetas en el eje X
      datasets: [
        {
          label: 'Cantidad de Alumnos por Perfil',
          data: conteoLimitado,
          backgroundColor: ['#ff7f50', '#6a5acd', '#3cb371', '#ff6347'],
        }
      ]
    });
  };

  // Actualizar las gráficas cuando los alumnos filtrados cambian
  useEffect(() => {
    generateChartDataNotas(filteredAlumnos);
    generateChartDataPerfiles(filteredAlumnos);
  }, [filteredAlumnos]);

  // Manejadores de eventos de clic en las gráficas
  const handleNoteClick = (event) => {
    const { active } = event;
    if (active.length > 0) {
      const clickedIndex = active[0]._index;
      setSelectedNoteRange(clickedIndex);
      setSelectedProfile(null); // Limpiar el filtro de perfil
      setCurrentPage(1); // Reiniciar a la primera página
    }
  };

  const handleProfileClick = (event) => {
    const { active } = event;
    if (active.length > 0) {
      const clickedIndex = active[0]._index;
      const selectedProfile = chartDataPerfiles.labels[clickedIndex];
      setSelectedProfile(selectedProfile);
      setSelectedNoteRange(null); // Limpiar el filtro de nota
      setCurrentPage(1); // Reiniciar a la primera página
    }
  };

  // Calcular los índices de los elementos a mostrar
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAlumnos.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="teacher-dashboard">
      <h1>Visualización de Alumnos y Predicciones</h1>
      {error && <p>{error}</p>}

      {/* Filtros de curso */}
      <div className="course-filters">
        {cursos.map((curso) => (
          <button
            key={curso}
            className={`course-button ${selectedCurso === curso ? 'active' : ''}`}
            onClick={() => handleCursoChange(curso)}
          >
            {curso}
          </button>
        ))}
        <button className="course-button" onClick={() => handleCursoChange(null)}>
          Ver todos
        </button>
      </div>

      {/* Contenedor para las gráficas */}
      <div className="charts-container">
        {/* Gráfica de distribución de notas */}
        <div className="chart-item">
          {filteredAlumnos.length > 0 && <Line data={chartDataNotas} onElementsClick={handleNoteClick} />}
        </div>

        {/* Gráfica por perfiles */}
        <div className="chart-item">
          {filteredAlumnos.length > 0 && <Bar data={chartDataPerfiles} onElementsClick={handleProfileClick} />}
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Alumno</th>
              <th>Nota Predicha</th>
              <th>Cluster</th>
              <th>Cluster Número</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((alumno, index) => (
                <tr key={index}>
                  <td>{alumno.Curso}</td>
                  <td>{alumno.Alumno}</td>
                  <td>{alumno.Nota_predicha}</td>
                  <td>{alumno.Cluster}</td>
                  <td>{alumno.Cluster_numero}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay datos disponibles</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Controles de paginación */}
        <div className="pagination-controls">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span> {currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastItem >= filteredAlumnos.length}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessorVisualization;