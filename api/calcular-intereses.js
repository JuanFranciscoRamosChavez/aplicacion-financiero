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
  // Ajustar fechas para obtener todos los CCP mensuales del rango
  // Primer día del mes inicial
  const primerDiaInicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
  const fechaIniStr = formatearFecha(primerDiaInicio);
  
  // Último día del mes final
  const ultimoDiaFin = new Date(fechaFinal.getFullYear(), fechaFinal.getMonth() + 1, 0);
  const fechaFinStr = formatearFecha(ultimoDiaFin);
  
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

  // Obtener el último CCP disponible para usar cuando no haya datos
  let ultimoCCPDisponible = fechasCCPOrdenadas.length > 0
    ? fechasCCPOrdenadas[fechasCCPOrdenadas.length - 1].valor
    : 0;

  let fecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);

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

    // Obtener CCP del mes directamente de Banxico
    let ccpMes;
    const claveMes = `${año}-${String(mes).padStart(2, '0')}`;

    // Buscar el CCP del mes actual usando UTC para evitar problemas de zona horaria
    const ccpDelMes = fechasCCPOrdenadas.filter(item => {
      // Usar getUTC* para trabajar siempre en UTC y evitar cambios por zona horaria
      return item.fecha.getUTCFullYear() === año && item.fecha.getUTCMonth() === mes - 1;
    });

    if (ccpDelMes.length > 0) {
      // Ordenar por fecha para asegurar consistencia
      ccpDelMes.sort((a, b) => a.fecha - b.fecha);

      // Tomar el primer valor del mes (valor oficial publicado)
      ccpMes = ccpDelMes[0].valor;
      ultimoCCPDisponible = ccpMes; // Actualizar el último valor disponible
    } else {
      // Si no hay valor para ese mes específico, usar el último valor disponible
      ccpMes = ultimoCCPDisponible;

      if (ccpMes === 0) {
        throw new Error(`No hay datos de CCP disponibles para ${claveMes}. La fecha final puede estar muy cerca del presente o ser futura.`);
      }
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
      ccpPorcentaje: parseFloat(ccpMes.toFixed(2)),
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
