import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Mitad izquierda - Formulario */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 lg:flex-none">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          {/* Form Container */}
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-6">
            {children}
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ¿No tienes una cuenta?{" "}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Contáctanos
              </a>
            </p>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>Copyright © 2025 Plexident. Todos los derechos reservados.</p>
              <div className="mt-2 space-x-4">
                <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">
                  Términos de Servicio
                </a>
                <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">
                  Política de Privacidad
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mitad derecha - Imagen que ocupa toda la mitad */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-blue-600 dark:bg-blue-900">
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="/images/logo1/LogoLogin1.png"
            alt="Plexident Logo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}