// types/auth.ts
export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  username: string;
  correo: string;
  rol: 'admin' | 'odontologo' | 'asistente';
  activo: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token?: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}