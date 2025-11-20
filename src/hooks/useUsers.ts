// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { useAuth , type User } from '../context/AuthContext';
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar usuarios';
      console.error('Error fetching users:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // 🔹 Crear usuario
  const addUser = useCallback(async (userData: Omit<User, 'id'> & { contrasena: string }): Promise<User> => {
    if (!isAuthenticated) {
      throw new Error('No estás autenticado');
    }

    try {
      const newUser = await createUser(userData);
      await loadUsers(); // Recargar la lista
      return newUser;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear usuario';
      console.error('Error creating user:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAuthenticated, loadUsers]);

  // 🔹 Actualizar usuario
  const editUser = useCallback(async (id: string, userData: Partial<User> & { contrasena?: string }): Promise<User> => {
    if (!isAuthenticated) {
      throw new Error('No estás autenticado');
    }

    try {
      const updatedUser = await updateUser(id, userData);
      await loadUsers(); // Recargar la lista
      return updatedUser;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al actualizar usuario';
      console.error('Error updating user:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAuthenticated, loadUsers]);

  // 🔹 Eliminar usuario
  const removeUser = useCallback(async (id: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('No estás autenticado');
    }

    try {
      await deleteUser(id);
      await loadUsers(); // Recargar la lista
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al eliminar usuario';
      console.error('Error deleting user:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAuthenticated, loadUsers]);

  // 🔹 Cargar usuarios al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  return {
    users,
    loading,
    error,
    loadUsers,
    addUser,
    editUser,
    removeUser,
  };
};