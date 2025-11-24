// components/auth/SignInForm.tsx - VERSIÓN CORREGIDA
import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth, type User } from "../../context/AuthContext";

interface LoginFormData {
  username: string;
  password: string;
}

// 🔹 CORREGIR la interfaz de respuesta
interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  detail?: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.username || !formData.password) {
      setError("Por favor, completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Intentando login...', { username: formData.username, password: '***' });

      // 🔹 1. Obtener token JWT y datos del usuario
      const response = await fetch('http://localhost:8000/api/users/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data: LoginResponse = await response.json();
      console.log('📨 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.detail || data.message || `Error ${response.status}: ${response.statusText}`);
      }

      // 🔹 CORRECCIÓN: Verificar la estructura correcta
      if (data.success && data.tokens?.access && data.user) {
        console.log('✅ Login exitoso, token recibido');
        console.log('👤 Datos del usuario:', data.user);
        console.log('🔑 Token de acceso:', data.tokens.access);
        
        // 🔹 2. Usar los datos que ya vienen en la respuesta
        login(data.user, data.tokens.access);
        
      } else {
        console.error('❌ Estructura de respuesta inválida:', data);
        setError('Respuesta del servidor inválida');
      }
      
    } catch (error: unknown) {
      console.error('❌ Error en login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión con el servidor';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // El resto del código permanece igual...
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-center text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¡Introduce tu Usuario!
            </p>
          </div>
          <div>
            {error && (
              <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username">
                    Usuario <span className="text-error-500">*</span>
                  </Label>
                  <Input 
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Introduce tu usuario" 
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Introduce tu contraseña"
                      required
                      disabled={loading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isChecked} 
                      onChange={setIsChecked}
                      disabled={loading}
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Mantenme conectado
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    ¿Has olvidado tu contraseña?
                  </Link>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}