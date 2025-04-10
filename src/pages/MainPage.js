import React, { useEffect, useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import axios from "axios";
import "../styles/Common.css";

const MainPage = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [selectedMensaje, setSelectedMensaje] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);

  useEffect(() => {
    const getUserData = () => {
      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");

      setUser(storedUser ? JSON.parse(storedUser) : null);
      setRole(storedRole || "");
    };

    getUserData();
    window.addEventListener("storage", getUserData);
    
    return () => {
      window.removeEventListener("storage", getUserData);
    };
  }, []);

  useEffect(() => {
    if ((role === "student" || role === "teacher") && user?.id) {
      obtenerMensajes(user.id);
    }
  }, [role, user]);

  const obtenerMensajes = async (idUsuario) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/mensajes/lista/${idUsuario}`);
      setMensajes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error obteniendo los mensajes:", error);
      setError("Error al cargar los mensajes");
      setMensajes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMensajeClick = (mensaje) => {
    setSelectedMensaje(mensaje);
    setShowModal(true);
    setShowReplyForm(false);
    setReplySuccess(false);
  };

  const handleResponder = () => {
    setShowReplyForm(true);
    setReplySuccess(false);
    setReplyError(null);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setSendingReply(true);
    setReplyError(null);
  
    try {
      const response = await axios.post('http://localhost:5000/mensajes/guardar', {
        id_usuario_receptor: selectedMensaje.id_usuario_emisor,
        id_usuario_emisor: user.id,
        asunto: `Re: ${selectedMensaje.asunto}`,
        texto: replyContent
      });
  
      if (response.data.message === 'Mensaje enviado correctamente') {
        setReplySuccess(true);
        setReplyContent("");
        setTimeout(() => {
          setShowReplyForm(false);
          setShowModal(false);
          obtenerMensajes(user.id);
        }, 1500);
      }
    } catch (error) {
      console.error("Error enviando respuesta:", error);
      setReplyError(error.response?.data?.message || "Error al enviar la respuesta");
    } finally {
      setSendingReply(false);
    }
  };

  // Función para renderizar la sección de mensajes (reutilizable)
  const renderMessagesSection = () => (
    <div className="messages-container">
      <div className="messages-header">
        <h2 className="messages-title">Tus mensajes</h2>
      </div>
      
      {loading ? (
        <div className="loading-messages">
          <div className="loading-spinner"></div>
          Cargando mensajes...
        </div>
      ) : error ? (
        <div className="error-messages">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
          <button 
            onClick={() => user?.id && obtenerMensajes(user.id)} 
            className="retry-button"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="messages-list-container" style={{ maxHeight: "300px", overflowY: "auto" }}>
          <div className="messages-list-container max-h-[300px] overflow-y-auto">
          {mensajes.length > 0 ? (
            <ul className="messages-list">
              {mensajes.map((mensaje) => (
                <li 
                  key={mensaje.id || Math.random()} 
                  className="message-item"
                  onClick={() => handleMensajeClick(mensaje)}
                >
                  <div className="message-header">
                    <div>
                      <p className="message-subject">
                        {mensaje.asunto || "Sin asunto"}
                      </p>
                      <p className="message-sender">
                        De: {mensaje.nombre_emisor || "Desconocido"}
                      </p>
                      <p className="message-date">
                        {new Date(mensaje.fecha_envio).toLocaleDateString() || "Fecha desconocida"}
                      </p>
                    </div>
                  </div>
                  {mensaje.contenido && (
                    <p className="message-preview">
                      {mensaje.contenido.substring(0, 100)}...
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-messages">
              <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              No tienes mensajes en tu bandeja de entrada.
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      <Header />
      <main id="content" className="main-content">
        <div className="welcome-container">
          <h1 className="welcome-title">
            Bienvenid@ a Performy
          </h1>

          <p className="welcome-description">
            Nos especializamos en proporcionar predicciones académicas precisas y útiles para estudiantes y profesores universitarios. 
            <br/><br/>
            Usando avanzados algoritmos de análisis, nuestra plataforma te permite obtener una visión clara sobre el rendimiento académico y el perfil de cada estudiante.
            <br/><br/>
            Ya sea que seas estudiante o profesor, nuestra herramienta está diseñada para ofrecerte información valiosa que te ayudará a tomar decisiones informadas sobre tu educación.
          </p>

          {!user ? (
            <div className="auth-section">
              <p className="auth-text">Por favor, inicia sesión para acceder a las funciones:</p>
              <a href="/login" className="login-button">
                Iniciar sesión
              </a>
            </div>
          ) : role === "teacher" ? (
            <div className="student-section">
              <div className="student-actions">
              <p className="actions-title">Acciones disponibles para profesores:</p>
              <div className="buttons-container">
                <a href="/ProfessorDash" className="action-button">
                  Ir al Dash de Profesor
                </a>
                <a href="/import-data" className="action-button">
                  Importar Datos
                </a>
              </div>
              </div>
              {renderMessagesSection()}
            </div>
          ) : role === "admin" ? (
            <div className="actions-section">
              <p className="actions-title">Acciones disponibles para administradores:</p>
              <a href="/Administration" className="admin-button">
                Ir al Panel de Administración
              </a>
            </div>
          ) : role === "student" ? (
            <div className="student-section">
              <div className="student-actions">
                <p className="actions-title">Acciones disponibles para estudiantes:</p>
                <a href="/StudentDash" className="action-button">
                  Ir al Dash de Estudiante
                </a>
              </div>
              {renderMessagesSection()}
            </div>
          ) : null}
        </div>
        
      </main>
      <Footer />
      
      {/* Modal/Popup para mostrar el mensaje completo */}
      
      {showModal && selectedMensaje && (
        <div className="message-modal-overlay">
          <div className="message-modal">
            {!showReplyForm ? (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">
                    {selectedMensaje.asunto || "Sin asunto"}
                  </h3>
                  
                </div>
                
                <div className="message-info-compact">
                  <p className="info-item">
                    <strong>De:</strong>
                       {selectedMensaje.nombre_emisor || "Desconocido"}
                  </p>
                  <p className="info-item">
                    <strong>Fecha:</strong> {new Date(selectedMensaje.fecha_envio).toLocaleString() || "Fecha desconocida"}
                  </p>
                </div>
                
                <div className="modal-content-scrollable">
                  <div className="message-body-compact">
                    <p className="message-content">
                      {selectedMensaje.texto || "No hay contenido en este mensaje."}
                    </p>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button onClick={() => setShowModal(false)} className="cancel-btn">
                    Cerrar
                  </button>
                  <button onClick={handleResponder} className="send-btn">
                    Responder
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleReplySubmit} className="reply-form">
                <div className="modal-header">
                  <h3 className="modal-title">
                    Responder a: {selectedMensaje.asunto || "Sin asunto"}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="modal-close-button"
                  >
                    <svg className="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    required
                    disabled={sendingReply}
                  />
                </div>

                {replyError && <div className="error-message">{replyError}</div>}
                {replySuccess && (
                  <div className="success-message">¡Respuesta enviada correctamente!</div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="cancel-btn"
                    disabled={sendingReply}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={sendingReply || !replyContent.trim()}
                  >
                    {sendingReply ? (
                      <>
                        <span className="spinner"></span> Enviando...
                      </>
                    ) : (
                      "Enviar Respuesta"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;