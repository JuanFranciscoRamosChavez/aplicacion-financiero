// api/test-enero-2019.js
// Endpoint de prueba específico para verificar enero 2019

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const TOKEN = process.env.BANXICO_TOKEN || process.env.VITE_BANXICO_TOKEN;
  
  if (!TOKEN) {
    return res.status(500).json({ 
      error: 'Token de Banxico no configurado' 
    });
  }

  try {
    // Consultar todo enero 2019
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF3368/datos/2019-01-01/2019-01-31`;
    
    console.log('[TEST] Consultando Banxico para enero 2019:', url);
    
    const response = await fetch(url, {
      headers: { 'Bmx-Token': TOKEN }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de Banxico ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const datos = data?.bmx?.series?.[0]?.datos;
    
    if (!datos || datos.length === 0) {
      return res.status(200).json({
        mensaje: 'No se encontraron datos para enero 2019',
        valoresEncontrados: 0
      });
    }

    // Procesar todos los valores
    const valoresProcesados = datos.map(d => {
      if (d.dato === "N/E") {
        return {
          fechaOriginal: d.fecha,
          valor: null,
          nota: 'Valor no disponible'
        };
      }
      
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
    }).filter(v => v.valor !== null);

    // Determinar cuál usaría el algoritmo
    const primerValor = valoresProcesados[0];

    res.status(200).json({
      consulta: 'Enero 2019',
      url: url,
      totalValoresEncontrados: valoresProcesados.length,
      todosLosValores: valoresProcesados,
      valorQueUsariaAlgoritmo: primerValor,
      conclusion: valoresProcesados.length === 1 
        ? `Solo hay un valor: ${primerValor.valorRedondeado2Decimales}%`
        : `Hay ${valoresProcesados.length} valores, el algoritmo usa el primero: ${primerValor.valorRedondeado2Decimales}%`
    });

  } catch (error) {
    console.error('[TEST] Error:', error);
    res.status(500).json({ 
      error: 'Error al consultar Banxico',
      details: error.message 
    });
  }
}
