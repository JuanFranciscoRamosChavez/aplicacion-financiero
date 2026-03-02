// api/banxico.js - Vercel Serverless Function
// Esta función replica la lógica del código Python para consultar Banxico

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

  // Obtener parámetros de la query
  const { serie, fechaInicio, fechaFinal } = req.query;

  console.log('Petición recibida:', { serie, fechaInicio, fechaFinal });

  if (!serie || !fechaInicio || !fechaFinal) {
    console.error('Faltan parámetros');
    return res.status(400).json({ 
      error: 'Faltan parámetros requeridos: serie, fechaInicio, fechaFinal' 
    });
  }

  // Token de Banxico desde variable de entorno
  const TOKEN = process.env.BANXICO_TOKEN || process.env.VITE_BANXICO_TOKEN;
  
  if (!TOKEN) {
    console.error('Token no configurado');
    return res.status(500).json({ 
      error: 'Token de Banxico no configurado en el servidor' 
    });
  }

  try {
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${serie}/datos/${fechaInicio}/${fechaFinal}`;
    
    console.log('Consultando Banxico:', url);
    
    const response = await fetch(url, {
      headers: {
        'Bmx-Token': TOKEN
      }
    });

    console.log('Respuesta de Banxico:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de Banxico:', response.status, errorText);
      throw new Error(`Error de Banxico: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Datos recibidos de Banxico:', JSON.stringify(data).substring(0, 200));
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error en el handler:', error);
    res.status(500).json({ 
      error: 'Error al consultar la API de Banxico',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
