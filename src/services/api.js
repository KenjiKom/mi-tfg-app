import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Tu URL base del backend

// Función para obtener los alumnos y predicciones de un profesor por su id
export const getAlumnosPredicciones = async (idProfesor) => {
  try {
    const response = await axios.get(`${API_URL}/predicciones/alumnos/${idProfesor}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los alumnos y predicciones:', error);
    throw error; // Lanzamos el error para manejarlo más arriba si es necesario
  }
};

// Puedes agregar más funciones de API según lo necesites, por ejemplo:
// export const getAsignaturas = async () => {...}
// export const getEventos = async () => {...}
