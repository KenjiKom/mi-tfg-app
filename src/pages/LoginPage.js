import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import logo from '../imgs/logo.png';

const LoginPage = () => {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    setError(null);
    axios
      .get('http://localhost:5000/usuarios/login', {
        params: { Nombre: nombre, Contrasena: contrasena },
      })
      .then(response => {
        const user = response.data;
  
        if (user) {
          // Determinar el rol basado en los valores booleanos
          let role = "student"; // Valor por defecto
          if (user.is_teacher) role = "teacher";
          if (user.is_admin) role = "admin"; // Si hay admin, tiene prioridad
  
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('role', role);
          localStorage.setItem('id', user.id);
          localStorage.setItem('name', user.Nombre);
  
          navigate('/');
          window.location.reload(); // Forzar la recarga para aplicar los cambios
        } else {
          setError("Error: No se recibió una respuesta válida del servidor.");
        }
      })
      .catch(() => {
        setError('Nombre de usuario o contraseña incorrectos.');
      });
  };
  

  return (
    <div className="login-page">
      
      <div className="login-form">
      <img src={logo} alt="Logo" className="logo"/>   
        <h1>Iniciar sesión</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Ingrese su nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Ingrese su contraseña"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
          />
        </div>
        <button onClick={handleLogin}>Iniciar sesión</button>
      </div>
    </div>
  );
};

export default LoginPage;
