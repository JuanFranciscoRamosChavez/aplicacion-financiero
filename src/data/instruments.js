// src/data/instruments.js

export const INSTRUMENTS = {
  MX: [
    { id: 'mx_deuda', name: 'Instrumentos de Deuda (Cetes, Bonos gub/corp)' },
    { id: 'mx_acciones', name: 'Acciones / Mercado de Capitales' },
    { id: 'mx_cobertura', name: 'Sociedades de Inversión de Cobertura' },
    { id: 'mx_rentafija', name: 'Sociedades de Inversión de Deuda / Renta Fija' },
    { id: 'mx_rentavar', name: 'Sociedades de Inversión de Renta Variable' },
    { id: 'mx_derivados', name: 'Derivados (Futuros, Opciones)' },
    { id: 'mx_otros', name: 'Instrumentos de liquidez inmediata (Metales, Criptomonedas, etc.)' }
  ],
  US: [
    { id: 'us_deuda', name: 'Deuda (Bonos del Tesoro, Eurobonos).' },
    { id: 'us_acciones', name: 'Acciones / Mercado de Capitales (Bolsas Internacionales).' },
    { id: 'us_deuda_fi', name: 'Sociedades de Inversión de Deuda / Renta fija.' },
    { id: 'us_rentavar', name: 'Sociedades de Inversión de Renta Variable.' },
    { id: 'us_derivados', name: 'Derivados Internacionales' },
    { id: 'us_otros', name: 'Instrumentos de liquidez inmediata (Metales, Criptomonedas, etc.)' }
  ]
};