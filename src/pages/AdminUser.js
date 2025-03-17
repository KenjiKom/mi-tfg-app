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

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
    <div>
    <Header />
    <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id = "content"></main>
      <h2>Gestión de Usuarios</h2>
      
      {/* Formulario de agregar/editar usuario */}
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
      />
      <input
        type="password"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        placeholder="Contraseña"
      />
      <label>
        Profesor
        <input
          type="checkbox"
          checked={isTeacher}
          onChange={() => setIsTeacher(!isTeacher)}
        />
      </label>
      <label>
        Administrador
        <input
          type="checkbox"
          checked={isAdmin}
          onChange={() => setIsAdmin(!isAdmin)}
        />
      </label>
      <button onClick={handleSubmit}>
        {currentUsuario ? 'Actualizar' : 'Agregar'}
      </button>

      {/* Tabla de usuarios */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Es Profesor</th>
            <th>Es Administrador</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.Nombre}</td>
              <td>{usuario.is_teacher ? 'Sí' : 'No'}</td>
              <td>{usuario.is_admin ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => handleEdit(usuario)}>Editar</button>
                <button onClick={() => handleDelete(usuario.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    <Footer />
    </div>
    </div>
  );
};

export default AdminUser;
