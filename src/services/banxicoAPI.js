// src/services/banxicoAPI.js

/**
 * Consulta serie de Banxico a través de nuestra API proxy
 * En desarrollo: usa el plugin de Vite que hace proxy a Banxico
 * En producción: usa la función serverless de Vercel
 */
export async function obtenerSerieBanxico(serie, fechaInicio, fechaFinal) {
  try {
    const apiUrl = `/api/banxico?serie=${serie}&fechaInicio=${fechaInicio}&fechaFinal=${fechaFinal}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    const datos = data?.bmx?.series?.[0]?.datos;
    if (!datos || datos.length === 0) {
      console.warn('No se encontraron datos para la serie', serie, 'entre', fechaInicio, 'y', fechaFinal);
      return {};
    }
    
    const resultado = {};
    datos.forEach(d => {
      if (d.dato !== "N/E") {
        const [dia, mes, año] = d.fecha.split('/');
        const fecha = new Date(`${año}-${mes}-${dia}`);
        resultado[fecha.toISOString()] = parseFloat(d.dato);
      }
    });
    
    return resultado;
  } catch (error) {
    console.error('Error consultando Banxico:', error);
    throw error;
  }
}

/**
 * Obtiene el valor de UDI para una fecha específica
 */
export async function obtenerUDI(fecha) {
  const fechaStr = formatearFecha(fecha);
  const datos = await obtenerSerieBanxico("SP68257", fechaStr, fechaStr);
  const valores = Object.values(datos);
  return valores.length > 0 ? valores[0] : null;
}

/**
 * Obtiene CCP mensual entre dos fechas
 */
export async function obtenerCCPMensual(fechaInicio, fechaFinal) {
  const fechaIniStr = formatearFecha(fechaInicio);
  const fechaFinStr = formatearFecha(fechaFinal);
  return await obtenerSerieBanxico("SF3368", fechaIniStr, fechaFinStr);
}

/**
 * Formatea fecha a YYYY-MM-DD
 */
function formatearFecha(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

/**
 * Obtiene días en un mes
 */
function diasEnMes(año, mes) {
  return new Date(año, mes, 0).getDate();
}

/**
 * Genera la tabla de intereses mensuales
 */
export async function generarTablaIntereses(montoEnUdis, fechaInicio, fechaFinal, udiFinal) {
  const filas = [];
  const ccpMensual = await obtenerCCPMensual(fechaInicio, fechaFinal);
  
  // Ordenar fechas CCP
  const fechasCCPOrdenadas = Object.entries(ccpMensual)
    .map(([k, v]) => ({ fecha: new Date(k), valor: v }))
    .sort((a, b) => a.fecha - b.fecha);
  
  let fecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
  let primerMes = true;
  
  while (fecha <= fechaFinal) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const diasDelMes = diasEnMes(año, mes);
    
    // Calcular días efectivos del mes
    let dias;
    if (fecha.getMonth() === fechaInicio.getMonth() && fecha.getFullYear() === fechaInicio.getFullYear()) {
      dias = diasDelMes - fechaInicio.getDate() + 1;
    } else if (fecha.getMonth() === fechaFinal.getMonth() && fecha.getFullYear() === fechaFinal.getFullYear()) {
      dias = fechaFinal.getDate();
    } else {
      dias = diasDelMes;
    }
    
    // Obtener CCP del mes
    const fechaCierreMes = new Date(año, mes - 1, diasDelMes);
    let ccpMes;
    
    if (primerMes) {
      // Primer mes: primer CCP disponible después de fechaInicio
      const ccpEncontrado = fechasCCPOrdenadas.find(item => item.fecha >= fechaInicio);
      ccpMes = ccpEncontrado ? ccpEncontrado.valor : 0;
      primerMes = false;
    } else {
      // Meses siguientes: valor más reciente hasta último día del mes
      const ccpsHastaMes = fechasCCPOrdenadas.filter(item => item.fecha <= fechaCierreMes);
      ccpMes = ccpsHastaMes.length > 0 ? ccpsHastaMes[ccpsHastaMes.length - 1].valor : 0;
    }
    
    // Convertir porcentaje a decimal
    const ccpDecimal = ccpMes / 100;
    const ccpAjustado = ccpDecimal * 1.25;
    const factorDiario = ccpAjustado / 365;
    const interesMensualUdis = factorDiario * dias;
    const interesMontoUdis = interesMensualUdis * montoEnUdis;
    const interesEnPesos = interesMontoUdis * udiFinal;
    
    filas.push({
      mes: `${String(mes).padStart(2, '0')}-${año}`,
      ccpPorcentaje: ccpMes,
      ccpAjustado,
      factorDiario,
      dias,
      interesMensualUdis,
      interesMontoUdis,
      interesEnPesos
    });
    
    // Siguiente mes
    if (mes === 12) {
      fecha = new Date(año + 1, 0, 1);
    } else {
      fecha = new Date(año, mes, 1);
    }
  }
  
  // Calcular totales
  const sumInteresMensualUdis = filas.reduce((sum, f) => sum + f.interesMensualUdis, 0);
  const sumInteresMontoUdis = filas.reduce((sum, f) => sum + f.interesMontoUdis, 0);
  const sumInteresEnPesos = filas.reduce((sum, f) => sum + f.interesEnPesos, 0);
  
  return {
    filas,
    totales: {
      interesMensualUdis: sumInteresMensualUdis,
      interesMontoUdis: sumInteresMontoUdis,
      interesEnPesos: sumInteresEnPesos
    }
  };
}
