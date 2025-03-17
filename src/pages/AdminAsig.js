import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const AdminAsig = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [currentAsignatura, setCurrentAsignatura] = useState(null);
  const [nombre, setNombre] = useState('');

  // Obtener todas las asignaturas al cargar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/admin/asignaturas')
      .then(response => setAsignaturas(response.data))
      .catch(error => console.error('Error al obtener las asignaturas:', error));
  }, []);

  // Manejar el borrado de una asignatura
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/asignaturas/${id}`)
      .then(() => {
        setAsignaturas(asignaturas.filter(asignatura => asignatura.id !== id));
      })
      .catch(error => console.error('Error al eliminar la asignatura:', error));
  };

  // Manejar la edición de una asignatura
  const handleEdit = (asignatura) => {
    setCurrentAsignatura(asignatura);
    setNombre(asignatura.Nombre);
  };

  // Manejar el formulario de agregar o editar
  const handleSubmit = () => {
    const asignaturaData = { Nombre: nombre };

    if (currentAsignatura) {
      // Actualizar asignatura
      axios.put(`http://localhost:5000/admin/asignaturas/${currentAsignatura.id}`, asignaturaData)
        .then(response => {
          setAsignaturas(asignaturas.map(asignatura => 
            asignatura.id === currentAsignatura.id ? response.data : asignatura
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar la asignatura:', error));
    } else {
      // Crear nueva asignatura
      axios.post('http://localhost:5000/admin/asignaturas', asignaturaData)
        .then(response => {
          setAsignaturas([...asignaturas, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar la asignatura:', error));
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setCurrentAsignatura(null);
    setNombre('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id="content">
        <h2>Gestión de Asignaturas</h2>
        
        {/* Formulario de agregar/editar asignatura */}
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la asignatura"
        />
        <button onClick={handleSubmit}>
          {currentAsignatura ? 'Actualizar' : 'Agregar'}
        </button>

        {/* Tabla de asignaturas */}
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.map((asignatura) => (
              <tr key={asignatura.id}>
                <td>{asignatura.Nombre}</td>
                <td>
                  <button onClick={() => handleEdit(asignatura)}>Editar</button>
                  <button onClick={() => handleDelete(asignatura.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAsig;
