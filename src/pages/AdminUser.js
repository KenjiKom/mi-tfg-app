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
  const itemsPerPage = 6;

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
    const usuarioData = { 
      Nombre: nombre, 
      Contrasena: contrasena, 
      is_teacher: isTeacher, 
      is_admin: isAdmin 
    };

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
    <div className="page-container">
      <main id="content" className="admin-container">
        <Header/>
        
        <div className="admin-content-wrapper">
          {/* Formulario a la izquierda */}
          <div className="admin-form">
            <div className="form-header">
              <h2 className="form-title">Gestión de Usuarios</h2>
            </div>
            
            <div className="form-group compact-group">
              <label htmlFor="nombre">Nombre</label>
              <input 
                id="nombre"
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Nombre completo" 
                className="form-control compact-input"
              />
            </div>

            <div className="form-group compact-group">
              <label htmlFor="contrasena">Contraseña</label>
              <input 
                id="contrasena"
                type="password"
                value={contrasena} 
                onChange={(e) => setContrasena(e.target.value)} 
                placeholder="Contraseña segura" 
                className="form-control compact-input"
              />
            </div>

            <div className="form-group compact-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={isTeacher} 
                  onChange={() => setIsTeacher(!isTeacher)} 
                  className="checkbox-input"
                />
                <span className="checkbox-label">Profesor</span>
              </label>
            </div>

            <div className="form-group compact-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={isAdmin} 
                  onChange={() => setIsAdmin(!isAdmin)} 
                  className="checkbox-input"
                />
                <span className="checkbox-label">Administrador</span>
              </label>
            </div>

            <div className="form-actions compact-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>
                {currentUsuario ? 'Actualizar' : 'Agregar'}
              </button>
              {currentUsuario && (
                <button className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Tabla de usuarios a la derecha */}
          <div className="admin-table-container">
            <div className="admin-search">
              <input 
                type="text" 
                placeholder="Buscar usuario..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="admin-input"
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
                      <div className="admin-actions">
                        <button 
                          className="admin-button edit" 
                          onClick={() => handleEdit(usuario)}
                        >
                          Editar
                        </button>
                        <button 
                          className="admin-button delete" 
                          onClick={() => handleDelete(usuario.id)}
                        >
                          Eliminar
                        </button>
                      </div>
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
              <span>Página {currentPage} de {totalPages}</span>
              <button 
                className="pagination-button" 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
        
        <Footer/>
      </main>
    </div>
  );
};

export default AdminUser;