// types/IUser.ts

export interface IUser {
  id: string;
  nombres: string;
  apellidos: string;
  username:string;
  telefono?: string; 
  correo: string;
  password: string; 
  rol: 'admin' | 'odontologo' | 'asistente';
  activo?: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface ICreateUserData {
  nombres: string;
  apellidos: string;
  username:string;
  telefono?: string; 
  correo: string;
  password: string; // Se envía como texto plano, el backend la hashea
  rol: 'admin' | 'odontologo' | 'asistente';
  activo?: boolean;
}

export interface IUpdateUserData {
  nombres?: string;
  apellidos?: string;
  username:string;
  correo?: string;
  telefono?: string; 
  password?: string;
  rol?: 'admin' | 'odontologo' | 'asistente';
  activo?: boolean;
}


export interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onConfirm: () => void;
}

export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  formData: UserFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  loading: boolean;
  user?: IUser | null;
}

export interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onEdit: () => void;
}

// types/IUser.ts - Agregar estas interfaces corregidas
export interface UserFormPageProps {
  onUserCreated?: () => void;
}


export interface UserFormData {
  activo: boolean;
  nombres: string;
  apellidos: string;
  username:string;
  telefono: string;
  correo: string;
  password: string;
  rol: 'admin' | 'odontologo' | 'asistente';
}

export interface UserFormFieldsProps {
  formData: UserFormData;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  submitLoading: boolean;
}

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAnother: () => void;
  message?: string | null;
}

// Para el formulario modal (mantener los existentes si los necesitas)
export interface UserModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  formData: UserFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  loading: boolean;
  user?: IUser | null;
}