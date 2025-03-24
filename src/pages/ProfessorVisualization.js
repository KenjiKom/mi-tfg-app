import React, { useEffect, useState, useMemo } from 'react';
import '../styles/ProfessorVisualization.css';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { Header, Footer } from "../components/HeaderFooter.js";
import { Pie } from 'react-chartjs-2';
import Modal from 'react-modal';
import * as XLSX from 'xlsx';

const ProfessorVisualization = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [selectedNota, setSelectedNota] = useState(null);
  const [selectedPerfil, setSelectedPerfil] = useState(null);
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

  const profesorId = localStorage.getItem('id');

  // Función para manejar el ordenamiento
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filtrar alumnos por asignatura, curso, nota seleccionada y perfil seleccionado
  const filteredAlumnos = useMemo(() => {
    return alumnos.filter(alumno => {
      const nota = Math.round(alumno.Nota_predicha / 10);
      return (
        (!selectedAsignatura || alumno.Asignatura === selectedAsignatura) &&
        (!selectedCurso || alumno.Curso === selectedCurso) &&
        (selectedNota === null || nota === selectedNota) &&
        (!selectedPerfil || alumno.Cluster === selectedPerfil)
      );
    });
  }, [alumnos, selectedAsignatura, selectedCurso, selectedNota, selectedPerfil]);

  // Función para ordenar los alumnos
  const sortedAlumnos = useMemo(() => {
    let sortableAlumnos = [...filteredAlumnos];
    if (sortConfig.key) {
      sortableAlumnos.sort((a, b) => {
        // Manejo especial para nota predicha
        if (sortConfig.key === 'Nota_predicha') {
          const aValue = a.Nota_predicha / 10;
          const bValue = b.Nota_predicha / 10;
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
        
        // Ordenamiento normal para otros campos
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableAlumnos;
  }, [filteredAlumnos, sortConfig]);

  // Función para filtrar por búsqueda
  const searchedAlumnos = useMemo(() => {
    if (!searchTerm) return sortedAlumnos;
    return sortedAlumnos.filter(alumno => 
      alumno.Alumno.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedAlumnos, searchTerm]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlumnos = searchedAlumnos.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < Math.ceil(searchedAlumnos.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
        setSelectedNota(index ?? -1); 
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

  // Informacion del alumno al clickear en el
  const handleAlumnoClick = async (alumno) => {
    if (!alumno.Alumno || !alumno.Asignatura || !alumno.Curso) {
        console.error("Faltan datos para obtener la matrícula:", alumno);
        return;
    }

    try {
        const response = await axios.get("http://localhost:5000/predicciones/detalle_alumno", {
            params: { 
                alumno: alumno.Alumno, 
                asignatura: alumno.Asignatura, 
                curso: alumno.Curso 
            },
        });
        setSelectedAlumno(response.data);
    } catch (error) {
        console.error("Error obteniendo detalles del alumno", error);
    }
  };

  const exportToExcel = () => {
    // Preparar los datos para exportar
    const dataToExport = searchedAlumnos.map(alumno => ({
      'Alumno': alumno.Alumno,
      'Nota Predicha': (alumno.Nota_predicha / 10).toFixed(2),
      'Perfil': alumno.Cluster,
      'Asignatura': alumno.Asignatura,
      'Curso': alumno.Curso
    }));

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alumnos");
    
    // Generar archivo y descargar
    const fileName = `alumnos_${selectedAsignatura || 'todas_asignaturas'}_${selectedCurso || 'todos_cursos'}.xlsx`;
    XLSX.writeFile(wb, fileName);
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
          
          {/* Barra de búsqueda */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Resetear a la primera página al buscar
              }}
            />
          </div>
          <br></br>
          <button 
              onClick={exportToExcel}
              className="export-excel-btn"
              disabled={searchedAlumnos.length === 0}
            >
              Exportar a Excel
            </button>
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('Alumno')}>
                  Alumno
                  {sortConfig.key === 'Alumno' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th onClick={() => requestSort('Nota_predicha')}>
                  Nota Predicha
                  {sortConfig.key === 'Nota_predicha' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th onClick={() => requestSort('Cluster')}>
                  Perfil
                  {sortConfig.key === 'Cluster' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentAlumnos.map((alumno) => (
                <tr key={alumno.id} onClick={() => handleAlumnoClick(alumno)}>
                  <td>{alumno.Alumno}</td> 
                  <td>{(alumno.Nota_predicha / 10).toFixed(2)}</td>
                  <td>{alumno.Cluster}</td>
                </tr>
              ))}
            </tbody>
          </table>
            <br/><br/>
            
            {/* Pop-up con informacion de alumno individual */}
            <Modal isOpen={!!selectedAlumno} onRequestClose={() => setSelectedAlumno(null)} className="modal-content">
            {selectedAlumno && (
            <div className="modal-content">
              <div className="modal-header">
                <h2>Detalles del Alumno</h2>
                <button className="modal-close-btn" onClick={() => setSelectedAlumno(null)}>&times;</button>
              </div>
              <p><strong>Nombre:</strong> {selectedAlumno.Alumno}</p>
              <p><strong>Asignatura:</strong> {selectedAlumno.Asignatura}</p>
              <p><strong>Curso:</strong> {selectedAlumno.Curso}</p>
              <p><strong>Nota Actual/Predicha:</strong> {selectedAlumno.Nota_predicha}</p>
              <p><strong>Fecha de Predicción:</strong> {selectedAlumno.Fecha_prediccion}</p>
              <p>El algoritmo de prediccion ha determinado el perfil del estudiante en base a las actividades registradas en el campus virtual.</p>
              <p>Número de actividades relevantes: <strong>{selectedAlumno.Eventos ? selectedAlumno.Eventos.length : 0}</strong></p>

              <h3>Actividades:</h3>
              {Array.isArray(selectedAlumno.Eventos) ? (
              selectedAlumno.Eventos.map((evento, index) => (
              <div key={index}>
                <p><strong>{evento.Evento}</strong> - {evento.Hora}</p>
              </div>
              ))
              ) : (
                <p>No hay eventos registrados</p>
              )}
              </div>
              )}
            </Modal>

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