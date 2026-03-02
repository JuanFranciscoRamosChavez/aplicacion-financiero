import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ============ FUNCIONES AUXILIARES (lógica del Python) ============

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
  
  const fechasCCPOrdenadas = Object.entries(ccpMensual)
    .map(([k, v]) => ({ fecha: new Date(k), valor: v }))
    .sort((a, b) => a.fecha - b.fecha);
  
  let fecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
  let primerMes = true;
  
  while (fecha <= fechaFinal) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const diasDelMes = diasEnMes(año, mes);
    
    let dias;
    if (fecha.getMonth() === fechaInicio.getMonth() && fecha.getFullYear() === fechaInicio.getFullYear()) {
      dias = diasDelMes - fechaInicio.getDate() + 1;
    } else if (fecha.getMonth() === fechaFinal.getMonth() && fecha.getFullYear() === fechaFinal.getFullYear()) {
      dias = fechaFinal.getDate();
    } else {
      dias = diasDelMes;
    }
    
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
    
    if (mes === 12) {
      fecha = new Date(año + 1, 0, 1);
    } else {
      fecha = new Date(año, mes, 1);
    }
  }
  
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

// ============ PLUGIN DE VITE ============

function banxicoDevPlugin() {
  return {
    name: 'banxico-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handler para /api/banxico
        if (req.url?.startsWith('/api/banxico?')) {
          try {
            const url = new URL(req.url, 'http://localhost:5173');
            const serie = url.searchParams.get('serie');
            const fechaInicio = url.searchParams.get('fechaInicio');
            const fechaFinal = url.searchParams.get('fechaFinal');
            
            if (!serie || !fechaInicio || !fechaFinal) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Faltan parámetros' }));
              return;
            }

            const token = process.env.VITE_BANXICO_TOKEN;
            if (!token) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Token de Banxico no configurado' }));
              return;
            }

            const banxicoUrl = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${serie}/datos/${fechaInicio}/${fechaFinal}`;
            
            console.log('[DEV] Consultando Banxico:', banxicoUrl);
            
            const response = await fetch(banxicoUrl, {
              headers: { 'Bmx-Token': token }
            });

            const data = await response.json();
            
            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
            return;
          } catch (error) {
            console.error('[DEV] Error en /api/banxico:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
            return;
          }
        }
        
        // Handler para /api/calcular-intereses
        if (req.url?.startsWith('/api/calcular-intereses')) {
          try {
            const url = new URL(req.url, 'http://localhost:5173');
            const monto = parseFloat(url.searchParams.get('monto'));
            const fechaInicio = url.searchParams.get('fechaInicio');
            const fechaFinal = url.searchParams.get('fechaFinal');
            
            if (!monto || !fechaInicio || !fechaFinal) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Faltan parámetros: monto, fechaInicio, fechaFinal' }));
              return;
            }

            const token = process.env.VITE_BANXICO_TOKEN;
            if (!token) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Token de Banxico no configurado en .env' }));
              return;
            }

            console.log('[DEV] Calculando intereses para:', { monto, fechaInicio, fechaFinal });

            // Ejecutar la lógica completa del cálculo
            const fechaIni = new Date(fechaInicio + 'T00:00:00');
            const fechaFin = new Date(fechaFinal + 'T00:00:00');

            const udiInicial = await obtenerUDI(fechaIni, token);
            const udiFinal = await obtenerUDI(fechaFin, token);

            if (!udiInicial || !udiFinal) {
              throw new Error('No se pudo obtener UDI para las fechas proporcionadas');
            }

            const montoEnUdis = monto / udiInicial;
            const montoFinal = montoEnUdis * udiFinal;
            const actualizacion = montoFinal - monto;

            const ccpMensual = await obtenerCCPMensual(fechaIni, fechaFin, token);
            const tablaIntereses = generarTablaIntereses(montoEnUdis, fechaIni, fechaFin, udiFinal, ccpMensual);

            const montoFinalConInteres = montoFinal + tablaIntereses.totales.interesEnPesos;

            const resultado = {
              monto,
              fechaInicio: fechaIni.toISOString(),
              fechaFinal: fechaFin.toISOString(),
              udiInicial,
              udiFinal,
              montoEnUdis,
              montoFinal,
              actualizacion,
              tablaIntereses,
              montoFinalConInteres
            };

            console.log('[DEV] Cálculo completado exitosamente');

            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(resultado));
            return;
          } catch (error) {
            console.error('[DEV] Error en /api/calcular-intereses:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message, stack: error.stack }));
            return;
          }
        }
        
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), banxicoDevPlugin()],
})
