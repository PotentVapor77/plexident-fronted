// services/userService.ts
import axios from 'axios';
import type { IUser, ICreateUserData, IUpdateUserData } from '../types/IUser';
import { getAccessToken } from './authService'; // ✅ Ahora esta importación funcionará

const BASE_URL = 'http://localhost:8000/api/users/';

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

// 🔹 Crear configuración de headers con autenticación JWT
const getAuthConfig = () => {
  const token = getAccessToken(); // ✅ Ahora esta función existe
  
  if (!token) {
    throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
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

// 🔹 Crear usuario - CON AUTENTICACIÓN JWT
export const createUser = async (userData: ICreateUserData): Promise<IUser> => {
  try {
    console.log('📝 Creando usuario con datos:', {
      ...userData,
      contrasena: '***',
    });

    const config = getAuthConfig();
    const response = await axios.post<IUser>(BASE_URL, userData, config);
    
    console.log('✅ Usuario creado exitosamente');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error creando usuario:', error.response?.data);
      
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para realizar esta acción.');
      }
      
      throw new Error(error.response?.data?.detail || 'Error al crear usuario');
    }
    throw error;
  }
};

// 🔹 Obtener todos los usuarios - CON AUTENTICACIÓN JWT
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const config = getAuthConfig();
    const response = await axios.get<IUser[]>(BASE_URL, config);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error obteniendo usuarios:', error.response?.data);
      
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }
      
      throw new Error(error.response?.data?.detail || 'Error al obtener usuarios');
    }
    throw error;
  }
};

// 🔹 Actualizar usuario - CON AUTENTICACIÓN JWT
export const updateUser = async (id: string, userData: IUpdateUserData): Promise<IUser> => {
  try {
    console.log(`📝 Actualizando usuario ${id}`, {
      ...userData,
      contrasena: userData.contrasena ? '***' : undefined,
    });

    const config = getAuthConfig();
    const response = await axios.put<IUser>(`${BASE_URL}${id}/`, userData, config);
    
    console.log('✅ Usuario actualizado exitosamente');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Error actualizando usuario ${id}:`, error.response?.data);
      
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }
      
      throw new Error(error.response?.data?.detail || 'Error al actualizar usuario');
    }
    throw error;
  }
};

// 🔹 Eliminar usuario - CON AUTENTICACIÓN JWT
export const deleteUser = async (id: string): Promise<void> => {
  try {
    const config = getAuthConfig();
    await axios.delete(`${BASE_URL}${id}/`, config);
    console.log('✅ Usuario eliminado exitosamente');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Error eliminando usuario ${id}:`, error.response?.data);
      
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }
      
      throw new Error(error.response?.data?.detail || 'Error al eliminar usuario');
    }
    throw error;
  }
};