import React, { useState, useEffect } from 'react';
import InterestResultsTable from './InterestResultsTable';
import jsPDF from 'jspdf';

export default function InterestCalculator() {
  // Cargar datos desde localStorage
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('interestCalculatorFormData');
    return saved ? JSON.parse(saved) : { monto: '', fechaInicio: '', fechaFinal: '' };
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultados, setResultados] = useState(null);
  
  // Estados para las nuevas funcionalidades
  const [ccpRangoFechas, setCcpRangoFechas] = useState(() => {
    const saved = localStorage.getItem('ccpRangoFechas');
    return saved ? JSON.parse(saved) : { inicio: '', fin: '' };
  });
  const [ccpFechaEspecifica, setCcpFechaEspecifica] = useState(() => {
    const saved = localStorage.getItem('ccpFechaEspecifica');
    return saved || '';
  });
  const [loadingCCP, setLoadingCCP] = useState(false);
  const [ccpResultado, setCcpResultado] = useState(() => {
    const saved = localStorage.getItem('ccpResultado');
    return saved ? JSON.parse(saved) : null;
  });
  const [ccpError, setCcpError] = useState(null);

  // Guardar formData en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('interestCalculatorFormData', JSON.stringify(formData));
  }, [formData]);

  // Guardar ccpRangoFechas en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('ccpRangoFechas', JSON.stringify(ccpRangoFechas));
  }, [ccpRangoFechas]);

  // Guardar ccpFechaEspecifica en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('ccpFechaEspecifica', ccpFechaEspecifica);
  }, [ccpFechaEspecifica]);

  // Guardar ccpResultado en localStorage cuando cambie
  useEffect(() => {
    if (ccpResultado) {
      localStorage.setItem('ccpResultado', JSON.stringify(ccpResultado));
    } else {
      localStorage.removeItem('ccpResultado');
    }
  }, [ccpResultado]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const monto = parseFloat(formData.monto);
      const fechaInicio = formData.fechaInicio;
      const fechaFinal = formData.fechaFinal;

      // Validaciones
      if (isNaN(monto) || monto <= 0) {
        throw new Error('El monto debe ser un número positivo');
      }

      if (new Date(fechaInicio) >= new Date(fechaFinal)) {
        throw new Error('La fecha inicial debe ser anterior a la fecha final');
      }

      // Validación de fecha futura - permitir hasta el mes anterior al actual
      const hoy = new Date();
      const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const fechaFinalObj = new Date(fechaFinal + 'T00:00:00');

      if (fechaFinalObj >= primerDiaMesActual) {
        const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const mesAnteriorStr = mesAnterior.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        throw new Error(
          `La fecha final debe ser anterior al mes actual. Banxico publica datos con retraso. ` +
          `Intenta con una fecha hasta ${mesAnteriorStr}.`
        );
      }

      // Llamar al backend que hace todo el cálculo
      const response = await fetch(`/api/calcular-intereses?monto=${monto}&fechaInicio=${fechaInicio}&fechaFinal=${fechaFinal}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el servidor');
      }

      const data = await response.json();
      
      // Convertir las fechas ISO a objetos Date para la visualización
      data.fechaInicio = new Date(data.fechaInicio);
      data.fechaFinal = new Date(data.fechaFinal);
      
      setResultados(data);
      
    } catch (err) {
      console.error('Error en el cálculo:', err);
      setError(err.message || 'Error desconocido al calcular');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ monto: '', fechaInicio: '', fechaFinal: '' });
    setResultados(null);
    setError(null);
    // Limpiar localStorage del formulario principal
    localStorage.removeItem('interestCalculatorFormData');
  };

  // Función para limpiar los datos de CCP
  const handleLimpiarCCP = () => {
    setCcpRangoFechas({ inicio: '', fin: '' });
    setCcpFechaEspecifica('');
    setCcpResultado(null);
    setCcpError(null);
    // Limpiar localStorage de CCP
    localStorage.removeItem('ccpRangoFechas');
    localStorage.removeItem('ccpFechaEspecifica');
    localStorage.removeItem('ccpResultado');
  };
  


  // Función para descargar CCP en PDF
  const handleDescargarCCPPDF = async () => {
    setCcpError(null);
    setLoadingCCP(true);
    
    try {
      const { inicio, fin } = ccpRangoFechas;
      
      if (!inicio || !fin) {
        throw new Error('Por favor ingresa ambas fechas');
      }
      
      if (new Date(inicio) >= new Date(fin)) {
        throw new Error('La fecha inicial debe ser anterior a la fecha final');
      }
      
      // Ajustar fechas para obtener todos los CCP mensuales del rango
      // CCP se publica mensualmente, ajustar al primer día del mes inicial y último día del mes final
      const fechaInicioObj = new Date(inicio + 'T00:00:00');
      const fechaFinObj = new Date(fin + 'T00:00:00');
      
      // Primer día del mes inicial
      const primerDiaInicio = new Date(fechaInicioObj.getFullYear(), fechaInicioObj.getMonth(), 1);
      const fechaInicioAjustada = primerDiaInicio.toISOString().split('T')[0];
      
      // Último día del mes final
      const ultimoDiaFin = new Date(fechaFinObj.getFullYear(), fechaFinObj.getMonth() + 1, 0);
      const fechaFinAjustada = ultimoDiaFin.toISOString().split('T')[0];

      // Consultar la API de Banxico para obtener CCP
      const response = await fetch(`/api/banxico?serie=SF3368&fechaInicio=${fechaInicioAjustada}&fechaFinal=${fechaFinAjustada}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al consultar Banxico');
      }
      
      const data = await response.json();
      const datos = data?.bmx?.series?.[0]?.datos;
      
      if (!datos || datos.length === 0) {
        throw new Error(`No se encontraron datos de CCP para el período ${inicio} al ${fin}`);
      }
      
      // Generar PDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Valores de CCP (Costo Porcentual Promedio)', 20, 20);
      
      // Rango de fechas
      doc.setFontSize(12);
      doc.text(`Período solicitado: ${inicio} al ${fin}`, 20, 35);
      doc.setFontSize(10);
      doc.text(`Valores mensuales disponibles (${datos.length} registros)`, 20, 45);
      
      // Encabezados de tabla
      doc.setFontSize(10);
      doc.text('Fecha', 20, 60);
      doc.text('Valor CCP (%)', 100, 60);
      doc.line(20, 62, 190, 62); // Línea horizontal
      
      // Datos
      let y = 70;
      datos.forEach((item, index) => {
        if (item.dato !== "N/E") {
          doc.text(item.fecha, 20, y);
          doc.text(parseFloat(item.dato).toFixed(2), 100, y);
          y += 7;
          
          // Nueva página si es necesario
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
        }
      });
      
      // Descargar PDF
      doc.save(`CCP_${inicio}_${fin}.pdf`);
      
      alert('PDF descargado exitosamente');
      
    } catch (err) {
      console.error('Error descargando CCP:', err);
      setCcpError(err.message);
    } finally {
      setLoadingCCP(false);
    }
  };

  // Función para consultar CCP de una fecha específica
  const handleConsultarCCPFecha = async () => {
    setCcpError(null);
    setCcpResultado(null);
    setLoadingCCP(true);
    
    try {
      if (!ccpFechaEspecifica) {
        throw new Error('Por favor ingresa una fecha');
      }
      
      // CCP se publica mensualmente, buscar en el rango del mes completo
      const fechaObj = new Date(ccpFechaEspecifica + 'T00:00:00');
      const año = fechaObj.getFullYear();
      const mes = fechaObj.getMonth(); // 0-11
      
      // Primer día del mes
      const primerDia = new Date(año, mes, 1);
      const primerDiaStr = primerDia.toISOString().split('T')[0];
      
      // Último día del mes
      const ultimoDia = new Date(año, mes + 1, 0);
      const ultimoDiaStr = ultimoDia.toISOString().split('T')[0];

      // Consultar la API de Banxico para obtener CCP del mes completo
      const response = await fetch(`/api/banxico?serie=SF3368&fechaInicio=${primerDiaStr}&fechaFinal=${ultimoDiaStr}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al consultar Banxico');
      }
      
      const data = await response.json();
      const datos = data?.bmx?.series?.[0]?.datos;
      
      if (!datos || datos.length === 0) {
        throw new Error(`No hay datos de CCP disponibles para ${mes + 1}/${año}. Intenta con otro mes.`);
      }
      
      // Tomar el primer valor disponible del mes (generalmente el día 1)
      const valorCCP = datos[0].dato;
      
      if (valorCCP === "N/E") {
        throw new Error('No hay datos disponibles para este mes');
      }
      
      setCcpResultado({
        fecha: datos[0].fecha,
        valor: parseFloat(valorCCP),
        fechaBuscada: ccpFechaEspecifica
      });
      
    } catch (err) {
      console.error('Error consultando CCP:', err);
      setCcpError(err.message);
    } finally {
      setLoadingCCP(false);
    }
  };

  if (resultados) {
    return <InterestResultsTable resultados={resultados} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Calculadora de Intereses Moratorios
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Cálculo con UDIs y CCP de Banxico
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Monto */}
            <div>
              <label htmlFor="monto" className="block text-sm font-semibold text-gray-700 mb-2">
                Monto en Pesos
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  value={formData.monto}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {/* Fecha Final */}
            <div>
              <label htmlFor="fechaFinal" className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Final
              </label>
              <input
                type="date"
                id="fechaFinal"
                name="fechaFinal"
                value={formData.fechaFinal}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculando...
                </span>
              ) : (
                'Calcular Intereses'
              )}
            </button>
          </form>

          {/* Sección de herramientas adicionales para CCP */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">
                Herramientas CCP (Costo Porcentual Promedio)
              </h2>
              <button
                onClick={handleLimpiarCCP}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                title="Limpiar todos los datos guardados de CCP"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar Datos
              </button>
            </div>
            
            {/* Descargar CCP en PDF */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar Valores de CCP en PDF
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicial
                  </label>
                  <input
                    type="date"
                    value={ccpRangoFechas.inicio}
                    onChange={(e) => setCcpRangoFechas(prev => ({ ...prev, inicio: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Final
                  </label>
                  <input
                    type="date"
                    value={ccpRangoFechas.fin}
                    onChange={(e) => setCcpRangoFechas(prev => ({ ...prev, fin: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-600 italic">
                💡 El CCP se publica mensualmente. Obtendrás todos los valores mensuales disponibles en el rango seleccionado.
              </p>
              
              <button
                onClick={handleDescargarCCPPDF}
                disabled={loadingCCP}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loadingCCP ? 'Generando PDF...' : 'Descargar PDF'}
              </button>
            </div>

            {/* Consultar CCP de fecha específica */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Consultar CCP de una Fecha Específica
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha a Consultar
                </label>
                <input
                  type="date"
                  value={ccpFechaEspecifica}
                  onChange={(e) => setCcpFechaEspecifica(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
                <p className="text-xs text-gray-600 italic mt-2">
                  💡 Se buscará el valor CCP del mes correspondiente a la fecha ingresada.
                </p>
              </div>
              
              <button
                onClick={handleConsultarCCPFecha}
                disabled={loadingCCP}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loadingCCP ? 'Consultando...' : 'Consultar Valor'}
              </button>
              
              {/* Resultado de CCP */}
              {ccpResultado && (
                <div className="mt-4 bg-white rounded-lg p-4 border-2 border-purple-300">
                  {ccpResultado.fechaBuscada && (
                    <div className="mb-3 pb-3 border-b border-purple-200">
                      <p className="text-xs text-gray-500">Fecha solicitada</p>
                      <p className="text-sm font-medium text-gray-700">{ccpResultado.fechaBuscada}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Fecha del CCP</p>
                      <p className="text-lg font-bold text-gray-800">{ccpResultado.fecha}</p>
                      <p className="text-xs text-gray-500 mt-1">Valor mensual publicado por Banxico</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Valor CCP</p>
                      <p className="text-2xl font-bold text-purple-600">{ccpResultado.valor.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mensaje de error común para CCP */}
            {ccpError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700">
                  <strong>Error:</strong> {ccpError}
                </p>
              </div>
            )}
          </div>

          {/* Info adicional */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los datos se obtienen de la API oficial de Banxico</li>
              <li>• El cálculo usa UDIs (Unidades de Inversión)</li>
              <li>• La tasa CCP se multiplica por 1.25 según normativa</li>
              <li>• <strong>CCP se publica mensualmente</strong>: si buscas una fecha específica, obtendrás el CCP del mes correspondiente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
