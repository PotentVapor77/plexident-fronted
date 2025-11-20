// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Interfaces mejoradas
export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  username: string;
  correo: string;
  rol: 'admin' | 'odontologo' | 'asistente';
  status: boolean;
  telefono?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Claves para localStorage
const STORAGE_KEYS = {
  USER: 'plexident_user',
  TOKEN: 'plexident_access_token',
} as const;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Cargar estado de autenticación al iniciar
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser) as User;
          setAuthState({
            user: userData,
            token: storedToken,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
          }));
        }
      } catch (error) {
        console.error('❌ Error cargando estado de autenticación:', error);
        // Limpiar datos corruptos
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    loadAuthState();
  }, []);

  // 🔹 Login mejorado con validación
  const login = useCallback((userData: User, authToken: string) => {
    if (!userData || !authToken) {
      console.error('❌ Datos de login inválidos');
      return;
    }

    try {
      // Validar estructura básica del usuario
      if (!userData.id || !userData.username || !userData.rol) {
        throw new Error('Datos de usuario incompletos');
      }

      setAuthState({
        user: userData,
        token: authToken,
        isLoading: false,
        isAuthenticated: true,
      });

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);

      console.log('✅ Login exitoso para:', userData.username);

      // Redirigir a la página original o al dashboard
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('❌ Error en login:', error);
      // Limpiar estado en caso de error
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, [navigate, location.state]);

  // 🔹 Logout mejorado
  const logout = useCallback(() => {
    const username = authState.user?.username || 'Usuario';
    
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });

    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);

    console.log('👋 Logout exitoso para:', username);
    
    // Redirigir al login
    navigate('/signin', { replace: true });
  }, [authState.user?.username, navigate]);

  // 🔹 Actualizar datos del usuario
  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...userData };
      
      // Actualizar localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  // 🔹 Obtener headers de autenticación
  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!authState.token) {
      throw new Error('No hay token de autenticación disponible');
    }

    return {
      'Authorization': `Bearer ${authState.token}`,
      'Content-Type': 'application/json',
    };
  }, [authState.token]);

  // 🔹 Valor del contexto
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook personalizado con validación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};

// 🔹 Hook para protección de rutas
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Podrías redirigir al login aquí si lo prefieres
      console.warn('⚠️ Acceso denegado: usuario no autenticado');
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
};

// 🔹 Hook para obtener headers automáticamente
export const useAuthHeaders = (): Record<string, string> => {
  const { getAuthHeaders, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    throw new Error('Usuario no autenticado');
  }

  return getAuthHeaders();
};