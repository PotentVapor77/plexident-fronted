import React from "react";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        
         <div className="text-center text-white">
            <h1 className="mb-4 text-4xl font-bold">Plexident</h1>
            <p className="text-xl opacity-90">Sistema de Gestión Odontológica</p>
            <p className="mt-4 opacity-80">Software especializado para consultorios dentales</p>
        </div>



        
      </div>
    </div>
  );
}
