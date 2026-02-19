// src/utils/scoring.js

/**
 * Calcula el puntaje total y determina el perfil del inversionista.
 * @param {Object} answers - Objeto con respuestas simples { qId: valor }
 * @param {Object} investments - Estado complejo de la pregunta 5
 */
export const calculateRiskProfile = (answers, investments) => {
  let totalScore = 0;

  // 1. Sumar respuestas simples (Q1-4, Q6-14)
  // Iteramos sobre las claves del objeto answers
  Object.keys(answers).forEach((key) => {
    // Nos aseguramos de sumar solo números válidos
    const val = parseInt(answers[key], 10);
    if (!isNaN(val)) {
      totalScore += val;
    }
  });

  // 2. Lógica Especial Pregunta 5 (Categorías)
  // Reglas:
  // - Internacional (US) o Ambas (MX + US) = 3 puntos
  // - Solo Nacional (MX) = 2 puntos
  // - Ninguna / Desconocida = 1 punto

  // Verificamos si hay algún instrumento activo en cada categoría
  const hasMX = Object.keys(investments).some(k => k.startsWith('mx_') && investments[k].active);
  const hasUS = Object.keys(investments).some(k => k.startsWith('us_') && investments[k].active);
  
  // Nota: Asumimos que si marcó "Ninguna" en la UI, el estado de investments está vacío o inactivo.
  
  if (hasUS) {
    totalScore += 3; 
  } else if (hasMX) {
    totalScore += 2;
  } else {
    totalScore += 1; // Valor por defecto para "Ninguna"
  }

  // 3. Determinar el Perfil según Rangos Oficiales
  let profile = '';
  let description = '';
  let colorClass = ''; // Clases de Tailwind para el color

  if (totalScore <= 14) {
    profile = 'Adverso al Riesgo';
    description = 'Prefiere una menor exposición al riesgo, esto podría significar una menor rentabilidad y una mayor probabilidad de preservar el capital.';
    colorClass = 'border-green-500 text-green-600 bg-green-50';
  } else if (totalScore <= 28) {
    profile = 'Moderado';
    description = 'Está dispuesto a invertir parte de su capital en títulos con cierta exposición al riesgo, esperando una mayor rentabilidad.';
    colorClass = 'border-yellow-500 text-yellow-600 bg-yellow-50';
  } else {
    profile = 'Propenso al Riesgo';
    description = 'Asume una fuerte exposición al riesgo, apostando a obtener una elevada rentabilidad.';
    colorClass = 'border-red-500 text-red-600 bg-red-50';
  }

  // 4. Bandera de Inversionista Sofisticado
  // Se activa si respondió "Sí" (valor 2) a la pregunta 12
  const isSophisticated = answers[12] === 2;

  return {
    score: totalScore,
    profile,
    description,
    colorClass,
    isSophisticated
  };
};