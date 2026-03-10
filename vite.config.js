import { defineConfig, loadEnv } from 'vite'
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
  
  const fechasCCPOrdenadas = Object.entries(ccpMensual)
    .map(([k, v]) => ({ fecha: new Date(k), valor: v }))
    .sort((a, b) => a.fecha - b.fecha);
  
  let fecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
  
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
    
    // Buscar el CCP del mes actual
    // El CCP se publica el día 1 de cada mes, buscar el valor de ese mes
    const primerDiaMesActual = new Date(año, mes - 1, 1);
    
    // Buscar el CCP del mes actual usando UTC para evitar problemas de zona horaria
    const ccpDelMes = fechasCCPOrdenadas.filter(item => {
      // Usar getUTC* para trabajar siempre en UTC
      return item.fecha.getUTCFullYear() === año && item.fecha.getUTCMonth() === mes - 1;
    });
    
    const claveMes = `${año}-${String(mes).padStart(2, '0')}`;
    
    // Log para ver el filtrado
    if (año === 2019 && mes === 1) {
      console.log(`[DEBUG FILTRO] Buscando: año=${año}, mes=${mes}, mes-1=${mes-1}`);
      console.log(`[DEBUG FILTRO] Fechas CCP disponibles en 2019:`);
      fechasCCPOrdenadas.filter(item => item.fecha.getUTCFullYear() === 2019).forEach(item => {
        console.log(`  Fecha: ${item.fecha.toISOString()}, getUTCMonth()=${item.fecha.getUTCMonth()}, Valor: ${item.valor}`);
      });
    }
    
    if (ccpDelMes.length > 0) {
      // Log ANTES de seleccionar
      if (año === 2019 && mes === 1) {
        console.log(`[DEV ${claveMes}] ===== TODOS LOS VALORES ENCONTRADOS =====`);
        ccpDelMes.forEach((item, idx) => {
          console.log(`  [${idx}] Fecha: ${item.fecha.toISOString()}, getUTCMonth(): ${item.fecha.getUTCMonth()}, Valor: ${item.valor}`);
        });
        console.log(`[DEV ${claveMes}] Total: ${ccpDelMes.length} valor(es)`);
      }
      
      // Usar el primer valor encontrado del mes (valor oficial de Banxico)
      ccpMes = ccpDelMes[0].valor;
      
      // Log para debugging en desarrollo
      if (año === 2019 && mes === 1) {
        console.log(`[DEV ${claveMes}] ✓ VALOR SELECCIONADO: ${ccpMes} (índice 0)`);
        console.log(`[DEV ${claveMes}] Después de toFixed(2): ${ccpMes.toFixed(2)}%`);
      }
    } else {
      // Si no hay valor para ese mes específico, buscar el más reciente anterior
      const ccpsAnteriores = fechasCCPOrdenadas.filter(item => item.fecha < primerDiaMesActual);
      ccpMes = ccpsAnteriores.length > 0 ? ccpsAnteriores[ccpsAnteriores.length - 1].valor : 0;
      console.log(`[DEV ${claveMes}] Sin datos, usando valor anterior: ${ccpMes}`);
    }
    
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
            
            // Debug: mostrar CCP obtenidos
            const numCCPs = Object.keys(ccpMensual).length;
            console.log(`[DEV] CCP obtenidos: ${numCCPs} valores desde ${fechaInicio} hasta ${fechaFinal}`);
            if (numCCPs > 0) {
              const fechasCCP = Object.keys(ccpMensual).sort();
              console.log(`[DEV] Primera fecha CCP: ${fechasCCP[0]} -> ${ccpMensual[fechasCCP[0]]}`);
              console.log(`[DEV] Última fecha CCP: ${fechasCCP[fechasCCP.length-1]} -> ${ccpMensual[fechasCCP[fechasCCP.length-1]]}`);
            }
            
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
        
        // Handler para /api/test-enero-2019 - Prueba específica
        if (req.url === '/api/test-enero-2019') {
          try {
            const token = process.env.VITE_BANXICO_TOKEN;
            if (!token) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Token de Banxico no configurado' }));
              return;
            }

            console.log('[DEV] Consultando enero 2019...');
            
            const banxicoUrl = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF3368/datos/2019-01-01/2019-01-31';
            
            const response = await fetch(banxicoUrl, {
              headers: { 'Bmx-Token': token }
            });

            if (!response.ok) {
              throw new Error(`Error de Banxico: ${response.status}`);
            }

            const data = await response.json();
            const datos = data?.bmx?.series?.[0]?.datos;
            
            if (!datos || datos.length === 0) {
              res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({
                mensaje: 'No se encontraron datos para enero 2019',
                valoresEncontrados: 0
              }));
              return;
            }

            // Procesar valores
            const valoresProcesados = datos.map(d => {
              if (d.dato === "N/E") return null;
              
              const [dia, mes, año] = d.fecha.split('/');
              const fechaISO = `${año}-${mes}-${dia}`;
              const fechaObj = new Date(fechaISO);
              
              return {
                fechaOriginal: d.fecha,
                fechaISO: fechaISO,
                fechaObjISO: fechaObj.toISOString(),
                valorString: d.dato,
                valorNumerico: parseFloat(d.dato),
                valorRedondeado2Decimales: parseFloat(parseFloat(d.dato).toFixed(2))
              };
            }).filter(v => v !== null);

            const primerValor = valoresProcesados[0];

            console.log('[DEV] Enero 2019 - Valores encontrados:', valoresProcesados.length);
            if (primerValor) {
              console.log('[DEV] Primer valor:', primerValor.valorRedondeado2Decimales + '%');
            }

            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
              consulta: 'Enero 2019',
              url: banxicoUrl,
              totalValoresEncontrados: valoresProcesados.length,
              todosLosValores: valoresProcesados,
              valorQueUsariaAlgoritmo: primerValor,
              conclusion: valoresProcesados.length === 1 
                ? `Solo hay un valor: ${primerValor.valorRedondeado2Decimales}%`
                : `Hay ${valoresProcesados.length} valores, el algoritmo usa el primero: ${primerValor.valorRedondeado2Decimales}%`
            }));
            return;
          } catch (error) {
            console.error('[DEV] Error en /api/test-enero-2019:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
            return;
          }
        }
        
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  
  // Debug: Verificar si el token se cargó
  console.log('🔑 Token de Banxico cargado:', env.VITE_BANXICO_TOKEN ? 'SÍ ✓' : 'NO ✗');
  
  // Hacer el token disponible en process.env para el middleware (solo en dev)
  if (mode === 'development') {
    process.env.VITE_BANXICO_TOKEN = env.VITE_BANXICO_TOKEN;
  }
  
  // Configurar plugins: el plugin de Banxico solo en desarrollo
  const plugins = [react()];
  if (mode === 'development') {
    plugins.push(banxicoDevPlugin());
  }
  
  return {
    plugins,
    build: {
      outDir: 'dist',
      sourcemap: false,
    }
  };
})
