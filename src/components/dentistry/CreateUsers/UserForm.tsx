// components/dentistry/CreateUsers/UserForm.tsx - ACTUALIZADO
import { useState, useCallback } from "react";
import { createUser } from "../../../services/userService";
import { AxiosError } from 'axios';
import { useModal } from "../../../hooks/useModal";
import UserFormFields from "./UserFromFields";
import SuccessModal from "./SuccessModal";
import type { UserFormPageProps, UserFormData } from "../../../types/IUser";
import { generateUsername } from "../../../utils/usernameGenerator";

export default function UserForm({ onUserCreated }: UserFormPageProps) {
  const [formData, setFormData] = useState<UserFormData>({
    activo: true,
    nombres: '',
    apellidos: '',
    username: '',
    telefono: '',
    correo: '',
    password: '',
    rol: 'asistente'
  });
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOpen: isSuccessModalOpen, openModal: openSuccessModal, closeModal: closeSuccessModal } = useModal();

  // Función para obtener el token del localStorage
  const getAuthToken = (): string => {
    const token = localStorage.getItem('plexident_access_token');
    if (!token) {
      throw new Error('No hay token de autenticación disponible. Por favor, inicie sesión nuevamente.');
    }
    return token;
  };

  // Función para actualizar el formulario y generar username automáticamente
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newData = { 
        ...prev, 
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
      };
      
      // Generar username automáticamente cuando se llenen nombres y apellidos
      if ((name === 'nombres' || name === 'apellidos') && newData.nombres && newData.apellidos) {
        const generatedUsername = generateUsername(newData.nombres, newData.apellidos);
        newData.username = generatedUsername;
      }
      
      // Si se borran nombres o apellidos, limpiar el username
      if ((name === 'nombres' && !value.trim()) || (name === 'apellidos' && !value.trim())) {
        newData.username = '';
      }
      
      return newData;
    });
  }, []);

  // Función para validar todos los campos obligatorios
  const validateFormData = (): string[] => {
    const errors: string[] = [];

    // Validar campos requeridos
    if (!formData.nombres.trim()) errors.push('Nombres es obligatorio');
    if (!formData.apellidos.trim()) errors.push('Apellidos es obligatorio');
    if (!formData.username.trim()) errors.push('Username es obligatorio');
    if (!formData.telefono.trim()) errors.push('Teléfono es obligatorio');
    if (!formData.correo.trim()) errors.push('Correo electrónico es obligatorio');
    if (!formData.rol) errors.push('Rol es obligatorio');
    if (!formData.password) errors.push('Contraseña es obligatoria');

    // Validaciones específicas de formato
    if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.push('El correo electrónico no es válido');
    }

    if (formData.telefono && !/^\d{10,}$/.test(formData.telefono.replace(/\D/g, ''))) {
      errors.push('El teléfono debe tener al menos 10 dígitos numéricos');
    }

    if (formData.password && formData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

   
    if (formData.rol && !['admin', 'odontologo', 'asistente'].includes(formData.rol)) {
      errors.push('El rol seleccionado no es válido');
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      activo: true,
      nombres: '',
      apellidos: '',
      username: '',
      telefono: '',
      correo: '',
      password: '',
      rol: 'asistente'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      alert('Errores de validación:\n' + validationErrors.join('\n'));
      return;
    }

    setSubmitLoading(true);
    
    try {
      console.log('Datos del usuario a guardar:', formData);

      // Obtener el token de autenticación
      const token = getAuthToken();

      // Preparar datos para enviar al servicio - ✅ INCLUIR USERNAME
      const userData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        username: formData.username.trim(), // ✅ Asegurar que se envíe el username
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim(),
        password: formData.password,
        rol: formData.rol,
        activo: formData.activo
      };

      console.log('📤 Datos que se enviarán al backend:', userData);

      // Crear nuevo usuario
      await createUser(token, userData);

      resetForm();
      setSuccessMessage(`Usuario ${userData.nombres} ${userData.apellidos} registrado exitosamente con username: ${userData.username}`);
      openSuccessModal();

      if (onUserCreated) {
        onUserCreated();
      }
    } catch (err: unknown) {
      console.error('Error al guardar usuario:', err);

      if (err instanceof AxiosError && err.response?.data) {
        console.error('Datos de error del servidor:', err.response.data);

        let errorMessage = 'Error al guardar el usuario:\n';

        if (typeof err.response.data === 'object') {
          Object.keys(err.response.data).forEach(key => {
            const errorValue = (err.response!.data as Record<string, unknown>)[key];
            if (Array.isArray(errorValue)) {
              errorMessage += `${key}: ${errorValue[0]}\n`;
            } else {
              errorMessage += `${key}: ${String(errorValue)}\n`;
            }
          });
        } else {
          errorMessage += String(err.response.data);
        }

        alert(errorMessage);
      } else if (err instanceof Error) {
        // Manejar errores de autenticación
        if (err.message.includes('token') || err.message.includes('autenticación')) {
          alert('Error de autenticación: ' + err.message + '\nPor favor, inicie sesión nuevamente.');
        } else {
          alert('Error: ' + err.message);
        }
      } else {
        alert('Error de conexión al guardar el usuario');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    closeSuccessModal();
    setSuccessMessage(null);
  };

  const handleRegisterAnother = () => {
    handleSuccessModalClose();
    resetForm();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Registrar Nuevo Usuario
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete todos los campos obligatorios para registrar un nuevo usuario
          </p>
        </div>

        {/* Formulario */}
        <UserFormFields
          formData={formData}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onReset={resetForm}
          submitLoading={submitLoading}
        />
      </div>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        onRegisterAnother={handleRegisterAnother}
        message={successMessage}
      />
    </div>
  );
}