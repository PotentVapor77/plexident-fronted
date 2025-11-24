// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { useAuth, type User } from '../context/AuthContext';

// Definir tipos para los datos de usuario
export interface CreateUserData extends Omit<User, 'id'> {
  contrasena: string;
}

export interface UpdateUserData extends Partial<Omit<User, 'id'>> {
  contrasena?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { isAuthenticated, token } = useAuth();

  // 🔹 Cargar usuarios
  const loadUsers = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !token) {
      setError('No estás autenticado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const usersData = await getAllUsers(token); // ✅ Pasar el token
      setUsers(usersData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // 🔹 Crear usuario
  const addUser = useCallback(async (userData: CreateUserData): Promise<User> => {
    if (!isAuthenticated || !token) {
      throw new Error('No estás autenticado');
    }

    try {
      const newUser = await createUser(token, userData); // ✅ Pasar el token
      await loadUsers(); // Recargar la lista
      return newUser;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      throw new Error(errorMessage);
    }
  }, [isAuthenticated, token, loadUsers]);

  // 🔹 Actualizar usuario
  const editUser = useCallback(async (id: string, userData: UpdateUserData): Promise<User> => {
    if (!isAuthenticated || !token) {
      throw new Error('No estás autenticado');
    }

    try {
      const updatedUser = await updateUser(token, id, userData); // ✅ Pasar el token
      await loadUsers(); // Recargar la lista
      return updatedUser;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      throw new Error(errorMessage);
    }
  }, [isAuthenticated, token, loadUsers]);

  // 🔹 Eliminar usuario
  const removeUser = useCallback(async (id: string): Promise<void> => {
    if (!isAuthenticated || !token) {
      throw new Error('No estás autenticado');
    }

    try {
      await deleteUser(token, id); // ✅ Pasar el token
      await loadUsers(); // Recargar la lista
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      throw new Error(errorMessage);
    }
  }, [isAuthenticated, token, loadUsers]);

  // 🔹 Limpiar errores
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // 🔹 Reiniciar estado
  const reset = useCallback(() => {
    setUsers([]);
    setLoading(false);
    setError('');
  }, []);

  // 🔹 Cargar usuarios al montar el componente
  useEffect(() => {
    if (isAuthenticated && token) {
      loadUsers();
    }
  }, [isAuthenticated, token, loadUsers]);

  return {
    // Estado
    users,
    loading,
    error,
    
    // Acciones principales
    loadUsers,
    addUser,
    editUser,
    removeUser,
    
    // Utilidades
    clearError,
    reset,
    
    // Estados derivados
    hasUsers: users.length > 0,
    usersCount: users.length,
  };
};