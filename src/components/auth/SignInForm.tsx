// components/auth/SignInForm.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
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
  const navigate = useNavigate();
  const location = useLocation();

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

      // 🔹 USAR EL ENDPOINT JWT CORRECTO
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Error ${response.status}: ${response.statusText}`);
      }

      if (data.access) {
        console.log('✅ Login exitoso, token recibido');
        
        // 🔹 OBTENER LOS DATOS DEL USUARIO CON EL TOKEN
        const userResponse = await fetch('http://localhost:8000/api/users/me/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('✅ Datos de usuario obtenidos:', userData);
          
          // 🔹 GUARDAR TOKEN Y USUARIO
          login(userData, data.access);
        } else {
          // Si no hay endpoint /me, crear usuario básico con los datos del login
          const basicUser = {
            id: 'temp-id',
            nombres: 'Usuario',
            apellidos: 'Sistema',
            username: formData.username,
            correo: `${formData.username}@sistema.com`,
            rol: 'odontologo' as const,
            status: true
          };
          login(basicUser, data.access);
        }
      } else {
        setError('No se recibió token de acceso');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      setError(error.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
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