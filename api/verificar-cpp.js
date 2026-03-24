// api/verificar-cpp.js
// Función serverless para verificar valores de CPP con trazabilidad completa
// Útil para debugging y validación de cálculos

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

  const { fecha, fechaInicio, fechaFinal } = req.query;

  console.log('[VERIFICACIÓN CPP] Parámetros recibidos:', { fecha, fechaInicio, fechaFinal });

  const TOKEN = process.env.BANXICO_TOKEN || process.env.VITE_BANXICO_TOKEN;
  
  if (!TOKEN) {
    return res.status(500).json({ 
      error: 'Token de Banxico no configurado' 
    });
  }

  try {
    let resultado;

    if (fecha) {
      // Verificación de una fecha específica
      resultado = await verificarCPPFechaEspecifica(fecha, TOKEN);
    } else if (fechaInicio && fechaFinal) {
      // Verificación de rango de fechas
      resultado = await verificarCPPRango(fechaInicio, fechaFinal, TOKEN);
    } else {
      return res.status(400).json({
        error: 'Debes proporcionar "fecha" o "fechaInicio" y "fechaFinal"'
      });
    }

    res.status(200).json(resultado);

  } catch (error) {
    console.error('[VERIFICACIÓN CPP] Error:', error);
    res.status(500).json({ 
      error: 'Error en verificación de CPP',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// ============ FUNCIONES DE VERIFICACIÓN ============

/**
 * Verifica el CPP para una fecha específica con trazabilidad completa
 */
async function verificarCPPFechaEspecifica(fechaStr, token) {
  console.log(`[VERIFICACIÓN] Fecha específica: ${fechaStr}`);
  
  const fecha = new Date(fechaStr + 'T00:00:00');
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  
  // Consultar todo el mes para ver qué valores hay disponibles
  const primerDia = new Date(año, mes - 1, 1);
  const ultimoDia = new Date(año, mes, 0);
  
  const primerDiaStr = formatearFecha(primerDia);
  const ultimoDiaStr = formatearFecha(ultimoDia);
  
  console.log(`[VERIFICACIÓN] Consultando CPP del mes completo: ${primerDiaStr} a ${ultimoDiaStr}`);
  
  // Obtener todos los valores del mes
  const cppsDelMes = await obtenerSerieBanxico("SF3368", primerDiaStr, ultimoDiaStr, token);
  
  // También consultar el mes anterior por si acaso
  const primerDiaMesAnterior = new Date(año, mes - 2, 1);
  const ultimoDiaMesAnterior = new Date(año, mes - 1, 0);
  const cppsDelMesAnterior = await obtenerSerieBanxico(
    "SF3368", 
    formatearFecha(primerDiaMesAnterior), 
    formatearFecha(ultimoDiaMesAnterior), 
    token
  );
  
  // Convertir a arrays ordenados
  const valoresDelMes = Object.entries(cppsDelMes)
    .map(([k, v]) => ({
      fecha: k,
      fechaObj: new Date(k),
      valor: v,
      valorFormateado: v.toFixed(2)
    }))
    .sort((a, b) => a.fechaObj - b.fechaObj);
  
  const valoresDelMesAnterior = Object.entries(cppsDelMesAnterior)
    .map(([k, v]) => ({
      fecha: k,
      fechaObj: new Date(k),
      valor: v,
      valorFormateado: v.toFixed(2)
    }))
    .sort((a, b) => a.fechaObj - b.fechaObj);
  
  // Determinar qué valor usaría el algoritmo actual
  let valorSeleccionado = null;
  let criterioSeleccion = '';
  
  if (valoresDelMes.length > 0) {
    valorSeleccionado = valoresDelMes[0];
    criterioSeleccion = 'Primer valor del mes actual';
  } else if (valoresDelMesAnterior.length > 0) {
    valorSeleccionado = valoresDelMesAnterior[valoresDelMesAnterior.length - 1];
    criterioSeleccion = 'Último valor del mes anterior (no hay datos en mes actual)';
  }
  
  return {
    verificacion: 'FechaEspecifica',
    fechaConsultada: fechaStr,
    año,
    mes,
    rangoConsultado: {
      inicio: primerDiaStr,
      fin: ultimoDiaStr
    },
    valoresEncontrados: {
      enMesActual: valoresDelMes.length,
      enMesAnterior: valoresDelMesAnterior.length
    },
    todosLosValoresMesActual: valoresDelMes,
    todosLosValoresMesAnterior: valoresDelMesAnterior,
    valorSeleccionadoPorAlgoritmo: valorSeleccionado ? {
      fecha: valorSeleccionado.fecha,
      valor: valorSeleccionado.valor,
      valorConDosDecimales: valorSeleccionado.valorFormateado,
      criterio: criterioSeleccion
    } : null,
    notasImportantes: [
      'El CPP se publica mensualmente por Banxico',
      'Serie SF3368 = CPP a plazo de 29 a 182 días',
      'Los valores pueden tener más de 2 decimales en la fuente',
      'El algoritmo toma el primer valor del mes o el último del mes anterior si no hay datos'
    ]
  };
}

/**
 * Verifica todos los CPP en un rango de fechas
 */
async function verificarCPPRango(fechaInicioStr, fechaFinalStr, token) {
  console.log(`[VERIFICACIÓN] Rango: ${fechaInicioStr} a ${fechaFinalStr}`);
  
  const fechaInicio = new Date(fechaInicioStr + 'T00:00:00');
  const fechaFinal = new Date(fechaFinalStr + 'T00:00:00');
  
  // Expandir el rango para cubrir meses completos
  const primerDiaInicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
  const ultimoDiaFin = new Date(fechaFinal.getFullYear(), fechaFinal.getMonth() + 1, 0);
  
  const rangoExpandido = {
    inicio: formatearFecha(primerDiaInicio),
    fin: formatearFecha(ultimoDiaFin)
  };
  
  console.log(`[VERIFICACIÓN] Rango expandido: ${rangoExpandido.inicio} a ${rangoExpandido.fin}`);
  
  // Obtener todos los CPPs del rango
  const cpps = await obtenerSerieBanxico("SF3368", rangoExpandido.inicio, rangoExpandido.fin, token);
  
  // Organizar por mes
  const cppsPorMes = {};
  Object.entries(cpps).forEach(([fechaISO, valor]) => {
    const fecha = new Date(fechaISO);
    const claveMes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    
    if (!cppsPorMes[claveMes]) {
      cppsPorMes[claveMes] = [];
    }
    
    cppsPorMes[claveMes].push({
      fecha: fechaISO,
      fechaFormateada: formatearFechaLegible(fecha),
      valor: valor,
      valorConDosDecimales: valor.toFixed(2),
      valorConCuatroDecimales: valor.toFixed(4)
    });
  });
  
  // Ordenar cada mes
  Object.keys(cppsPorMes).forEach(mes => {
    cppsPorMes[mes].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  });
  
  // Generar resumen
  const resumen = Object.entries(cppsPorMes).map(([mes, valores]) => ({
    mes,
    cantidadValores: valores.length,
    primerValor: valores[0],
    ultimoValor: valores[valores.length - 1],
    valorQueUsariaAlgoritmo: valores[0], // El algoritmo usa el primer valor del mes
    todosLosValores: valores
  }));
  
  return {
    verificacion: 'RangoFechas',
    rangoOriginal: {
      inicio: fechaInicioStr,
      fin: fechaFinalStr
    },
    rangoExpandido,
    totalValoresEncontrados: Object.keys(cpps).length,
    totalMesesAfectados: Object.keys(cppsPorMes).length,
    cppsPorMes: resumen,
    advertencias: generarAdvertencias(resumen),
    notasImportantes: [
      'El CPP se publica mensualmente',
      'Pueden existir múltiples valores en un mes (correcciones)',
      'El algoritmo actual toma el PRIMER valor del mes',
      'Verificar que esto coincida con la lógica esperada'
    ]
  };
}

/**
 * Genera advertencias basadas en los datos encontrados
 */
function generarAdvertencias(resumen) {
  const advertencias = [];
  
  resumen.forEach(mes => {
    if (mes.cantidadValores === 0) {
      advertencias.push(`⚠️ Sin datos para ${mes.mes}`);
    }
    
    if (mes.cantidadValores > 1) {
      const diferencia = Math.abs(
        mes.primerValor.valor - mes.ultimoValor.valor
      );
      if (diferencia > 0.001) {
        advertencias.push(
          `⚠️ ${mes.mes}: Múltiples valores (${mes.cantidadValores}), ` +
          `diferencia: ${diferencia.toFixed(4)} puntos`
        );
      }
    }
    
    // Verificar si el redondeo a 2 decimales cambia el valor significativamente
    const valorReal = mes.primerValor.valor;
    const valorRedondeado = parseFloat(mes.primerValor.valorConDosDecimales);
    const diferenciaRedondeo = Math.abs(valorReal - valorRedondeado);
    
    if (diferenciaRedondeo >= 0.005) {
      advertencias.push(
        `⚠️ ${mes.mes}: El redondeo a 2 decimales cambia significativamente el valor ` +
        `(${valorReal} → ${valorRedondeado})`
      );
    }
  });
  
  return advertencias;
}

// ============ FUNCIONES AUXILIARES ============

async function obtenerSerieBanxico(serie, fechaInicio, fechaFinal, token) {
  const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${serie}/datos/${fechaInicio}/${fechaFinal}`;
  
  console.log(`[BANXICO] Consultando: ${url}`);
  
  const response = await fetch(url, {
    headers: { 'Bmx-Token': token }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error de Banxico ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const datos = data?.bmx?.series?.[0]?.datos;
  
  if (!datos) {
    console.log('[BANXICO] No se encontraron datos');
    return {};
  }

  const resultado = {};
  datos.forEach(d => {
    if (d.dato !== "N/E") {
      const [dia, mes, año] = d.fecha.split('/');
      const fecha = new Date(`${año}-${mes}-${dia}`);
      resultado[fecha.toISOString()] = parseFloat(d.dato);
      
      console.log(`[BANXICO] ${d.fecha} -> ${d.dato}`);
    }
  });

  console.log(`[BANXICO] Total valores obtenidos: ${Object.keys(resultado).length}`);
  
  return resultado;
}

function formatearFecha(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

function formatearFechaLegible(fecha) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}
