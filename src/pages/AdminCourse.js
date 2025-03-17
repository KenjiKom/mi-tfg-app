import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const AdminCourse = () => {
    const [cursos, setCursos] = useState([]);
    const [currentCurso, setCurrentCurso] = useState(null);
    const [nombre, setNombre] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

  // Obtener todos los cursos al cargar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/admin/cursos')
      .then(response => setCursos(response.data))
      .catch(error => console.error('Error al obtener los cursos:', error));
  }, []);

  // Manejar el borrado de un curso
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/cursos/${id}`)
      .then(() => {
        setCursos(cursos.filter(curso => curso.id !== id));
      })
      .catch(error => console.error('Error al eliminar el curso:', error));
  };

  // Manejar la edición de un curso
  const handleEdit = (curso) => {
    setCurrentCurso(curso);
    setNombre(curso.Nombre);
  };

  // Manejar el formulario de agregar o editar
  const handleSubmit = () => {
    const cursoData = { Nombre: nombre };

    if (currentCurso) {
      // Actualizar curso
      axios.put(`http://localhost:5000/admin/cursos/${currentCurso.id}`, cursoData)
        .then(response => {
          setCursos(cursos.map(curso => 
            curso.id === currentCurso.id ? response.data : curso
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar el curso:', error));
    } else {
      // Crear nuevo curso
      axios.post('http://localhost:5000/admin/cursos', cursoData)
        .then(response => {
          setCursos([...cursos, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar el curso:', error));
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setCurrentCurso(null);
    setNombre('');
  };

  // Filtrar cursos por nombre
  const filteredCursos = cursos.filter(curso => curso.Nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCursos = filteredCursos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCursos.length / itemsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      <Header />
      <main className="flex-grow flex flex-col items-center p-6" id="content">
        <h2 className="text-xl font-bold mb-4">Gestión de Cursos</h2>
        
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar curso"
          />
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del curso"
          />
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSubmit}>
            {currentCurso ? 'Actualizar' : 'Agregar'}
          </button>
        </div>

        <table className="table-auto border-collapse w-3/4 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Nombre</th>
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentCursos.map((curso) => (
              <tr key={curso.id} className="text-center">
                <td className="border px-4 py-2">{curso.Nombre}</td>
                <td className="border px-4 py-2 flex justify-center space-x-2">
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(curso)}>Editar</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(curso.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button 
            className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="px-2">Página {currentPage} de {totalPages}</span>
          <button 
            className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminCourse;