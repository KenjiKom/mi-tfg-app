import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const getAlumnosPredicciones = async (idProfesor) => {
  try {
    const response = await axios.get(`${API_URL}/predicciones/alumnos/${idProfesor}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los alumnos y predicciones:', error);
    throw error; 
  }
};

