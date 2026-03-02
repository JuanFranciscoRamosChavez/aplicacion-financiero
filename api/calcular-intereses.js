// api/calcular-intereses.js
// Función serverless que replica TODA la lógica del código Python

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { monto, fechaInicio, fechaFinal } = req.method === 'POST' ? req.body : req.query;

  console.log('Calculando intereses para:', { monto, fechaInicio, fechaFinal });

  if (!monto || !fechaInicio || !fechaFinal) {
    return res.status(400).json({ 
      error: 'Faltan parámetros: monto, fechaInicio, fechaFinal' 
    });
  }

  const TOKEN = process.env.BANXICO_TOKEN || process.env.VITE_BANXICO_TOKEN;
  
  if (!TOKEN) {
    return res.status(500).json({ 
      error: 'Token de Banxico no configurado' 
    });
  }

  try {
    // Parsear datos
    const montoNum = parseFloat(monto);
    const fechaIni = new Date(fechaInicio + 'T00:00:00');
    const fechaFin = new Date(fechaFinal + 'T00:00:00');

    // Obtener UDI inicial y final
    const udiInicial = await obtenerUDI(fechaIni, TOKEN);
    const udiFinal = await obtenerUDI(fechaFin, TOKEN);

    if (!udiInicial || !udiFinal) {
      throw new Error('No se pudo obtener UDI para las fechas proporcionadas');
    }

    // Calcular monto en UDIS
    const montoEnUdis = montoNum / udiInicial;
    const montoFinal = montoEnUdis * udiFinal;
    const actualizacion = montoFinal - montoNum;

    // Obtener CCP mensual
    const ccpMensual = await obtenerCCPMensual(fechaIni, fechaFin, TOKEN);

    // Generar tabla de intereses
    const tablaIntereses = generarTablaIntereses(
      montoEnUdis,
      fechaIni,
      fechaFin,
      udiFinal,
      ccpMensual
    );

    const montoFinalConInteres = montoFinal + tablaIntereses.totales.interesEnPesos;

    // Responder con todos los datos
    res.status(200).json({
      monto: montoNum,
      fechaInicio: fechaIni.toISOString(),
      fechaFinal: fechaFin.toISOString(),
      udiInicial,
      udiFinal,
      montoEnUdis,
      montoFinal,
      actualizacion,
      tablaIntereses,
      montoFinalConInteres
    });

  } catch (error) {
    console.error('Error calculando intereses:', error);
    res.status(500).json({ 
      error: 'Error al calcular intereses',
      details: error.message 
    });
  }
}

// ============ FUNCIONES AUXILIARES (del código Python) ============

async function obtenerSerieBanxico(serie, fechaInicio, fechaFinal, token) {
  const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${serie}/datos/${fechaInicio}/${fechaFinal}`;
  
  const response = await fetch(url, {
    headers: { 'Bmx-Token': token }
  });

  if (!response.ok) {
    throw new Error(`Error de Banxico: ${response.status}`);
  }

  const data = await response.json();
  const datos = data?.bmx?.series?.[0]?.datos;
  
  if (!datos) return {};

  const resultado = {};
  datos.forEach(d => {
    if (d.dato !== "N/E") {
      const [dia, mes, año] = d.fecha.split('/');
      const fecha = new Date(`${año}-${mes}-${dia}`);
      resultado[fecha.toISOString()] = parseFloat(d.dato);
    }
  });

  return resultado;
}

async function obtenerUDI(fecha, token) {
  const fechaStr = formatearFecha(fecha);
  const datos = await obtenerSerieBanxico("SP68257", fechaStr, fechaStr, token);
  const valores = Object.values(datos);
  return valores.length > 0 ? valores[0] : null;
}

async function obtenerCCPMensual(fechaInicio, fechaFinal, token) {
  const fechaIniStr = formatearFecha(fechaInicio);
  const fechaFinStr = formatearFecha(fechaFinal);
  return await obtenerSerieBanxico("SF3368", fechaIniStr, fechaFinStr, token);
}

function formatearFecha(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

function diasEnMes(año, mes) {
  return new Date(año, mes, 0).getDate();
}

function generarTablaIntereses(montoEnUdis, fechaInicio, fechaFinal, udiFinal, ccpMensual) {
  const filas = [];
  
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
      const ccpEncontrado = fechasCCPOrdenadas.find(item => item.fecha >= fechaInicio);
      ccpMes = ccpEncontrado ? ccpEncontrado.valor : 0;
      primerMes = false;
    } else {
      const ccpsHastaMes = fechasCCPOrdenadas.filter(item => item.fecha <= fechaCierreMes);
      ccpMes = ccpsHastaMes.length > 0 ? ccpsHastaMes[ccpsHastaMes.length - 1].valor : 0;
    }
    
    // Cálculos
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
