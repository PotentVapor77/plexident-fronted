// services/authService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

// Configurar axios para incluir credenciales
axios.defaults.withCredentials = true;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

// 🔹 Login para obtener token JWT
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('🔐 Intentando login...', { username: credentials.username, password: '***' });

    const response = await axios.post<AuthResponse>(`${API_URL}login/`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { access, refresh } = response.data;
    
    // Guardar tokens en localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    console.log('✅ Login exitoso, token guardado');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error en login:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error de autenticación');
    }
    throw error;
  }
};

// 🔹 Obtener token almacenado - ESTA ES LA FUNCIÓN QUE FALTA
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// 🔹 Verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// 🔹 Logout
export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  console.log('👋 Sesión cerrada');
};

// 🔹 Obtener datos del usuario autenticado
export const getCurrentUser = async (): Promise<any> => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación disponible');
  }

  try {
    const response = await axios.get('http://localhost:8000/api/users/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error obteniendo usuario actual:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error al obtener usuario');
    }
    throw error;
  }
};