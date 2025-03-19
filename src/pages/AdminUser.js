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
  const [searchTerm, setSearchTerm] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Filtrar usuarios según el término de búsqueda
  const filteredUsuarios = usuarios.filter(usuario => 
    usuario.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  return (
  <main id="content" className="admin-container">
  <Header/>
  {/* Formulario a la izquierda */}
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

  {/* Tabla de usuarios a la derecha */}
  <div className="admin-table-container">
    <div className="admin-search">
      <input 
        type="text" 
        placeholder="Buscar usuario..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
    </div>

    <table className="admin-table">
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
              <button className="admin-button" onClick={() => handleEdit(usuario)}>Editar</button>
              <button className="admin-button" onClick={() => handleDelete(usuario.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Controles de paginación */}
    <div className="pagination">
      <button 
        className="pagination-button" 
        onClick={() => setCurrentPage(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        Anterior
      </button>
      <span>{currentPage} - {totalPages}</span>
      <button 
        className="pagination-button" 
        onClick={() => setCurrentPage(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </div>
  </div>
  <Footer/>
</main>
  );
};

export default AdminUser;
