// utils/usernameGenerator.ts
export const generateUsername = (nombres: string, apellidos: string): string => {
  if (!nombres || !apellidos) return '';
  
  // Primera letra del primer nombre en minúscula
  const primeraLetraNombre = nombres.trim().split(' ')[0].charAt(0).toLowerCase();
  
  // Primer apellido completo en minúscula, sin espacios ni caracteres especiales
  const primerApellido = apellidos.trim().split(' ')[0];
  const apellidoNormalizado = primerApellido
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]/g, ''); // Remover caracteres especiales
  
  return `${primeraLetraNombre}${apellidoNormalizado}`;
};

// Ejemplos:
// generateUsername("Ana María", "Sánchez García") → "asanchez"