import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const AdminUser = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Obtener todos los usuarios al cargar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/admin/usuarios')
      .then(response => setUsuarios(response.data))
      .catch(error => console.error('Error al obtener los usuarios:', error));
  }, []);

  // Manejar el borrado de un usuario
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/usuarios/${id}`)
      .then(() => {
        // Eliminar el usuario de la lista de usuarios
        setUsuarios(usuarios.filter(usuario => usuario.id !== id));
      })
      .catch(error => console.error('Error al eliminar el usuario:', error));
  };

  // Manejar la edición de un usuario
  const handleEdit = (usuario) => {
    setCurrentUsuario(usuario);
    setNombre(usuario.Nombre);
    setContrasena(usuario.Contrasena);
    setIsTeacher(usuario.is_teacher);
    setIsAdmin(usuario.is_admin);
  };

  // Manejar el formulario de agregar o editar
  const handleSubmit = () => {
    const usuarioData = { Nombre: nombre, Contrasena: contrasena, is_teacher: isTeacher, is_admin: isAdmin };

    if (currentUsuario) {
      // Actualizar usuario
      axios.put(`http://localhost:5000/admin/usuarios/${currentUsuario.id}`, usuarioData)
        .then(response => {
          setUsuarios(usuarios.map(usuario => 
            usuario.id === currentUsuario.id ? response.data : usuario
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar el usuario:', error));
    } else {
      // Crear nuevo usuario
      axios.post('http://localhost:5000/admin/usuarios', usuarioData)
        .then(response => {
          setUsuarios([...usuarios, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar el usuario:', error));
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setCurrentUsuario(null);
    setNombre('');
    setContrasena('');
    setIsTeacher(false);
    setIsAdmin(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsuarios = usuarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      <Header />
      <main className="flex-grow flex items-start justify-between p-6" id="content">
        <div className="w-1/3 bg-white p-4 rounded shadow-md">
          <h2>Gestión de Usuarios</h2>
          <input 
            type="text" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            placeholder="Nombre" 
            className="w-full p-2 mb-2 border rounded"
          />
          <input 
            type="password" 
            value={contrasena} 
            onChange={(e) => setContrasena(e.target.value)} 
            placeholder="Contraseña" 
            className="w-full p-2 mb-2 border rounded"
          />
          <div className="mb-2">
            <label>
              Profesor
              <input 
                type="checkbox" 
                checked={isTeacher} 
                onChange={() => setIsTeacher(!isTeacher)} 
              />
            </label>
          </div>
          <div className="mb-2">
            <label>
              Administrador
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={() => setIsAdmin(!isAdmin)} 
              />
            </label>
          </div>
          <button 
            onClick={handleSubmit} 
            className="w-full p-2 bg-blue-500 text-white rounded">
            {currentUsuario ? 'Actualizar' : 'Agregar'}
          </button>
        </div>

        <div className="w-2/3 pl-6">
          <table className="min-w-full bg-white rounded shadow-md">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Es Profesor</th>
                <th>Es Administrador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.Nombre}</td>
                  <td>{usuario.is_teacher ? 'Sí' : 'No'}</td>
                  <td>{usuario.is_admin ? 'Sí' : 'No'}</td>
                  <td>
                    <button onClick={() => handleEdit(usuario)} className="px-4 py-2 bg-yellow-500 text-white rounded mr-2">Editar</button>
                    <button onClick={() => handleDelete(usuario.id)} className="px-4 py-2 bg-red-500 text-white rounded">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center space-x-4 mt-4">
            <button 
              className="bg-gray-300 px-3 py-1 rounded" 
              onClick={handlePreviousPage} 
              disabled={currentPage === 1}>
              Anterior
            </button>
            <button 
              className="bg-gray-300 px-3 py-1 rounded" 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}>
              Siguiente
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUser;
