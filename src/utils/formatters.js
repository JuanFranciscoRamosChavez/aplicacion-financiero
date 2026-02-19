// src/utils/formatters.js

export const formatDate = (date = new Date()) => {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Si en el futuro necesitas formatear dinero para los inputs de %, lo agregas aquí.