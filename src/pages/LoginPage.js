import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

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
        localStorage.setItem('user', JSON.stringify(user));
        
        navigate('/');
      })
      .catch(() => {
        setError('Nombre de usuario o contraseña incorrectos.');
      });
  };

  return (
    <div className="login-page">
      <div className="login-form">
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
