// services/patientService.ts
import axios from 'axios';
import type { IPatient } from '../types/IPatient';

const BASE_URL = "http://localhost:8000/api/patients/";

// Función para obtener el token CSRF
function getCSRFToken(): string {
  const name = 'csrftoken';
  let cookieValue = '';
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Función para obtener el token JWT del localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('plexident_access_token');
}

// Configuración común para las peticiones axios
const getAuthConfig = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No hay token de autenticación disponible');
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(),
      'Authorization': `Bearer ${token}`,
    },
    withCredentials: true,
  };
};

// Función para obtener todos los pacientes
export const getAllPatients = async (): Promise<IPatient[]> => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(BASE_URL, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error obteniendo pacientes:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error al obtener pacientes');
    }
    throw error;
  }
};

// Función para obtener un paciente por ID
export const getPatientById = async (id: string): Promise<IPatient> => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(`${BASE_URL}${id}/`, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error obteniendo paciente ${id}:`, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error al obtener paciente');
    }
    throw error;
  }
};

// Función para crear un nuevo paciente
export const createPatient = async (patient: Omit<IPatient, 'id'>): Promise<IPatient> => {
  try {
    const config = getAuthConfig();
    const response = await axios.post(BASE_URL, patient, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creando paciente:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error al crear paciente');
    }
    throw error;
  }
};

// Función para actualizar un paciente
export const updatePatient = async (id: string, patient: Partial<IPatient>): Promise<IPatient> => {
  try {
    const config = getAuthConfig();
    const response = await axios.put(`${BASE_URL}${id}/`, patient, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error actualizando paciente ${id}:`, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error al actualizar paciente');
    }
    throw error;
  }
};

// Función para eliminar un paciente
export const deletePatient = async (id: string): Promise<void> => {
  try {
    const config = getAuthConfig();
    await axios.delete(`${BASE_URL}${id}/`, config);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error eliminando paciente ${id}:`, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error al eliminar paciente');
    }
    throw error;
  }
};

export default {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};