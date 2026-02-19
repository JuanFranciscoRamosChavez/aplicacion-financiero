// src/data/questions.js

export const QUESTIONS = [
  { 
    id: 1, 
    text: "¿Cuál es el objetivo fundamental de su inversión?", 
    opts: [
      { t: "Invertir en valores fácilmente convertibles en efectivo (Liquidez).", v: 1 },
      { t: "Generar una renta periódica en forma de intereses y/o dividendos (Ingreso).", v: 2 },
      { t: "Crecimiento a largo plazo del capital a través de la reinversión en el principal", v: 3 },
      { t: "Obtener mayores rentabilidades a cambio de mayores niveles de exposición al riesgo (Especulativo)", v: 4 }
    ] 
  },
  { 
    id: 2, 
    text: "¿En qué rango de edad se encuentra?", 
    opts: [
      { t: "Menor de 25 años", v: 4 },
      { t: "Entre 25-40 años", v: 3 },
      { t: "Entre 40-60 años", v: 2 },
      { t: "Más de 60 años", v: 1 }
    ] 
  },
  { 
    id: 3, 
    text: "¿Ha tenido experiencia invirtiendo?", 
    opts: [
      { t: "Sí", v: 2 },
      { t: "No", v: 1 }
    ] 
  },
  { 
    id: 4, 
    text: "En términos de tiempo, ¿cuál es su horizonte de inversión?", 
    opts: [
      { t: "Menos de 1 año", v: 1 },
      { t: "Entre 1 y 3 años", v: 2 },
      { t: "Más de 3 años", v: 3 }
    ] 
  },
  // La pregunta 5 se omite aquí porque tiene su propio componente complejo
  { 
    id: 6, 
    text: "¿Utiliza medios propios para evaluar y dar seguimiento a instrumentos financieros y a mercados bursátiles?", 
    opts: [
      { t: "Sí", v: 2 },
      { t: "No", v: 1 }
    ] 
  },
  { 
    id: 7, 
    text: "A la hora de tomar una decisión de inversión, ¿cuál factor incide más sobre ésta?", 
    opts: [
      { t: "Análisis elaborados personalmente", v: 2 },
      { t: "Información técnica de su Casa de Bolsa", v: 1 },
      { t: "El criterio de su asesor", v: 3 },
      { t: "Experiencias anteriores / Otras", v: 4 }
    ] 
  },
  { 
    id: 8, 
    text: "En caso de altas fluctuaciones y pérdidas de capital, ¿qué haría?", 
    opts: [
      { t: "No me siento cómodo (Vender)", v: 1 },
      { t: "Liquidar inmediatamente", v: 2 },
      { t: "Esperar un tiempo prudente", v: 3 },
      { t: "Mantener posiciones esperando recuperación en el mediano o largo plazo", v: 4 }
    ] 
  },
  { 
    id: 9, 
    text: "Si el valor de sus inversiones cae, ¿a partir de qué monto tomaría medidas extremas?", 
    opts: [
      { t: "-5%", v: 1 },
      { t: "-10%", v: 2 },
      { t: "-20%", v: 3 },
      { t: "No me inquieto", v: 4 }
    ] 
  },
  { 
    id: 10, 
    text: "¿Cuál afirmación se ajusta más a sus preferencias?", 
    opts: [
      { t: "Seguridad máxima, aunque los rendimientos sean bajos", v: 1 },
      { t: "Rendimientos competitivos con seguridad adecuada", v: 2 },
      { t: "Rendimientos superiores al mercado, riesgo moderado", v: 3 },
      { t: "Altos rendimientos a largo plazo, asumiendo fluctuaciones", v: 4 }
    ] 
  },
  { 
    id: 11, 
    text: "Defina su moneda de preferencia para realizar inversiones", 
    opts: [
      { t: "Pesos", v: 1 },
      { t: "Dólares", v: 2 },
      { t: "Euros", v: 3 },
      { t: "Otra / No tengo preferencia", v: 4 }
    ] 
  },
  { 
    id: 12, 
    text: "¿Se considera como un inversionista sofisticado?", 
    opts: [
      { t: "Sí", v: 2 },
      { t: "No", v: 1 }
    ] 
  },
  { 
    id: 13, 
    text: "¿Cuenta con portafolios de inversión en otras instituciones financieras?", 
    opts: [
      { t: "Sí", v: 2 },
      { t: "No", v: 1 }
    ] 
  },
  { 
    id: 14, 
    text: "¿Cuenta con inversiones de naturaleza no financiera (negocios, bienes raíces, etc.)?", 
    opts: [
      { t: "Sí", v: 2 },
      { t: "No", v: 1 }
    ] 
  }
];