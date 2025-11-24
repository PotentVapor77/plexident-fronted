// services/userService.ts - VERSIÓN CORREGIDA
import axios from 'axios';
import type { IUser, ICreateUserData, IUpdateUserData } from '../types/IUser';

const BASE_URL = 'http://localhost:8000/api/users/';

// 🔹 Crear configuración de headers con autenticación JWT
const createAuthConfig = (token: string) => {
  if (!token) {
    throw new Error('No hay token de autenticación disponible');
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    // withCredentials: true, // ⛔ ELIMINAR - no necesario con JWT
  };
};

// 🔹 Interfaz para la respuesta del backend
interface UsersResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: IUser[]; // Si usa paginación
}

// 🔹 Obtener todos los usuarios
export const getAllUsers = async (token: string): Promise<IUser[]> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.get<UsersResponse | IUser[]>(BASE_URL, config);
    
    console.log('📨 Respuesta de usuarios:', response.data);
    
    // 🔹 Manejar diferentes formatos de respuesta
    let users: IUser[];
    
    if (Array.isArray(response.data)) {
      // Si es un array directo
      users = response.data;
    } else if (response.data.results && Array.isArray(response.data.results)) {
      // Si tiene paginación (results)
      users = response.data.results;
    } else {
      console.error('❌ Formato de respuesta inesperado:', response.data);
      throw new Error('Formato de respuesta inesperado del servidor');
    }
    
    console.log(`✅ Obtenidos ${users.length} usuarios`);
    return users;
    
  } catch (error: unknown) {
    console.error('❌ Error en getAllUsers:', error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.error || 
                     error.response?.data?.message || 
                     'Error al obtener usuarios';
      throw new Error(message);
    }
    
    throw new Error('Error de conexión con el servidor');
  }
};

// 🔹 Crear usuario
export const createUser = async (token: string, userData: ICreateUserData): Promise<IUser> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.post<IUser>(BASE_URL, userData, config);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.error || 
                     'Error al crear usuario';
      throw new Error(message);
    }
    throw error;
  }
};

// 🔹 Actualizar usuario
export const updateUser = async (token: string, id: string, userData: IUpdateUserData): Promise<IUser> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.put<IUser>(`${BASE_URL}${id}/`, userData, config);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.error || 
                     'Error al actualizar usuario';
      throw new Error(message);
    }
    throw error;
  }
};

// 🔹 Eliminar usuario
export const deleteUser = async (token: string, id: string): Promise<void> => {
  try {
    const config = createAuthConfig(token);
    await axios.delete(`${BASE_URL}${id}/`, config);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.error || 
                     'Error al eliminar usuario';
      throw new Error(message);
    }
    throw error;
  }
};

// 🔹 Obtener usuario por ID
export const getUserById = async (token: string, id: string): Promise<IUser> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.get<IUser>(`${BASE_URL}/${id}/`, config);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.error || 
                     'Error al obtener usuario';
      throw new Error(message);
    }
    throw error;
  }
};