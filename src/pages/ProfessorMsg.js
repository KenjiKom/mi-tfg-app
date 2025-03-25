import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Header, Footer } from '../components/HeaderFooter';
import '../styles/Common.css';

const ProfessorMsg = () => {
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState(null);
  const [formData, setFormData] = useState({
    asunto: '',
    texto: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const parametro = useParams();
  const nombreAlumno = parametro.alumnoNombre;
  const profesorId = localStorage.getItem('id');

  useEffect(() => {
    const fetchAlumnoData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/usuarios/usuario`,{params: {nombreAlumno}});
        setAlumno(response.data);
      } catch (err) {
        setError('No se pudo cargar la información del alumno');
        console.error(err);
      }
    };

    if (nombreAlumno) {
      fetchAlumnoData();
    } else {
      setError('No se ha especificado un alumno');
    }
  }, [nombreAlumno]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await axios.post('http://localhost:5000/mensajes/guardar', {
        id_usuario_receptor: alumno.id,
        id_usuario_emisor: profesorId,
        asunto: formData.asunto,
        texto: formData.texto
      });

      setSuccess(true);
      setFormData({ asunto: '', texto: '' });
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(-1); // Volver a la página anterior
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el mensaje');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="teacher-dashboard">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6" id="content">
        <h1>Enviar mensaje al alumno</h1>
        
        {alumno && (
          <div className="alumno-info">
            <p>Enviando mensaje a: {alumno.Nombre}</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Mensaje enviado correctamente</div>}

        <form onSubmit={handleSubmit} className="message-form">
          <div className="form-group">
            <label htmlFor="asunto">Asunto:</label>
            <input
              type="text"
              id="asunto"
              name="asunto"
              placeholder="Asunto del mensaje..."
              value={formData.asunto}
              onChange={handleChange}
              required
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="texto">Mensaje:</label>
            <textarea
              id="texto"
              name="texto"
              placeholder="Escriba su mensaje..."
              value={formData.texto}
              onChange={handleChange}
              required
              rows="8"
              maxLength="2000"
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="send-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>

            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default ProfessorMsg;