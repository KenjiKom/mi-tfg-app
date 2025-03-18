import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';  
import '../styles/Admin.css';  

const AdminUser = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/admin/usuarios')
      .then(response => setUsuarios(response.data))
      .catch(error => console.error('Error al obtener los usuarios:', error));
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/admin/usuarios/${id}`)
      .then(() => {
        setUsuarios(usuarios.filter(usuario => usuario.id !== id));
      })
      .catch(error => console.error('Error al eliminar el usuario:', error));
  };

  const handleEdit = (usuario) => {
    setCurrentUsuario(usuario);
    setNombre(usuario.Nombre);
    setContrasena(usuario.Contrasena);
    setIsTeacher(usuario.is_teacher);
    setIsAdmin(usuario.is_admin);
  };

  const handleSubmit = () => {
    const usuarioData = { Nombre: nombre, Contrasena: contrasena, is_teacher: isTeacher, is_admin: isAdmin };

    if (currentUsuario) {
      axios.put(`http://localhost:5000/admin/usuarios/${currentUsuario.id}`, usuarioData)
        .then(response => {
          setUsuarios(usuarios.map(usuario => 
            usuario.id === currentUsuario.id ? response.data : usuario
          ));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar el usuario:', error));
    } else {
      axios.post('http://localhost:5000/admin/usuarios', usuarioData)
        .then(response => {
          setUsuarios([...usuarios, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al agregar el usuario:', error));
    }
  };

  const resetForm = () => {
    setCurrentUsuario(null);
    setNombre('');
    setContrasena('');
    setIsTeacher(false);
    setIsAdmin(false);
  };

  return (
    <div className="admin-page">
      <Header />
      <main id="content" className="admin-container">
        <div className="admin-form">
          <h2>Gestión de Usuarios</h2>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
          <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Contraseña" />
          <label>
            Profesor
            <input type="checkbox" checked={isTeacher} onChange={() => setIsTeacher(!isTeacher)} />
          </label>
          <label>
            Administrador
            <input type="checkbox" checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} />
          </label>
          <button className="admin-button" onClick={handleSubmit}>
            {currentUsuario ? 'Actualizar' : 'Agregar'}
          </button>
        </div>

        <div className="admin-table">
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
                    <button className="admin-button" onClick={() => handleEdit(usuario)}>Editar</button>
                    <button className="admin-button" onClick={() => handleDelete(usuario.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUser;
