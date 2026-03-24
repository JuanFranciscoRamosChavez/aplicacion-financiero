// src/utils/monedas.js

export const MONEDAS = {
  EUR: {
    simbolo: '€',
    nombre: 'Euro',
    codigo: 'EUR'
  },
  USD: {
    simbolo: '$',
    nombre: 'Dólar US',
    codigo: 'USD'
  },
  GBP: {
    simbolo: '£',
    nombre: 'Libra Esterlina',
    codigo: 'GBP'
  },
  JPY: {
    simbolo: '¥',
    nombre: 'Yen Japonés',
    codigo: 'JPY'
  },
  MXN: {
    simbolo: '$',
    nombre: 'Peso Mexicano',
    codigo: 'MXN'
  },
  ARS: {
    simbolo: '$',
    nombre: 'Peso Argentino',
    codigo: 'ARS'
  },
  COP: {
    simbolo: '$',
    nombre: 'Peso Colombiano',
    codigo: 'COP'
  },
  CHF: {
    simbolo: 'CHF',
    nombre: 'Franco Suizo',
    codigo: 'CHF'
  },
  CAD: {
    simbolo: 'C$',
    nombre: 'Dólar Canadiense',
    codigo: 'CAD'
  },
  AUD: {
    simbolo: 'A$',
    nombre: 'Dólar Australiano',
    codigo: 'AUD'
  }
};

export const MONEDAS_OPCIONES = Object.entries(MONEDAS).map(([codigo, datos]) => ({
  codigo,
  ...datos
}));

// Función para formatear valores con símbolo de moneda
export const formatearMoneda = (valor, codigoMoneda = 'EUR') => {
  const moneda = MONEDAS[codigoMoneda] || MONEDAS.EUR;
  
  // Si es un número, convertir a string con 2 decimales
  if (typeof valor === 'number') {
    return `${moneda.simbolo}${valor.toFixed(2)}`;
  }
  
  return `${moneda.simbolo}${valor}`;
};
