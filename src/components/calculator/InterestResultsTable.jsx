import React from 'react';

export default function InterestResultsTable({ resultados, onReset }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value, decimals = 6) => {
    return value.toFixed(decimals);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón de reset */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Resultados del Cálculo
            </h1>
            <button
              onClick={onReset}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
            >
              ← Nueva Consulta
            </button>
          </div>
        </div>

        {/* Resultado General */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
            📊 Resultado General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Monto inicial:</span>
                <span className="font-bold text-lg">{formatCurrency(resultados.monto)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">UDI {formatDate(resultados.fechaInicio)}:</span>
                <span className="font-semibold">{formatNumber(resultados.udiInicial, 6)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">UDI {formatDate(resultados.fechaFinal)}:</span>
                <span className="font-semibold">{formatNumber(resultados.udiFinal, 6)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Monto en UDIS:</span>
                <span className="font-semibold">{formatNumber(resultados.montoEnUdis, 2)} UDIS</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Monto actualizado:</span>
                <span className="font-bold text-lg">{formatCurrency(resultados.montoFinal)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Actualización:</span>
                <span className="font-bold text-green-600">{formatCurrency(resultados.actualizacion)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Intereses Mensuales */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
            📅 Tabla de Intereses Mensuales
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-3 py-3 text-left">Mes</th>
                  <th className="px-3 py-3 text-right">CCP (%)</th>
                  <th className="px-3 py-3 text-right">CCP×1.25</th>
                  <th className="px-3 py-3 text-right">÷365</th>
                  <th className="px-3 py-3 text-right">Días</th>
                  <th className="px-3 py-3 text-right">Int. Mensual UDIS</th>
                  <th className="px-3 py-3 text-right">Int. × Monto UDIS</th>
                  <th className="px-3 py-3 text-right">Int. en Pesos</th>
                </tr>
              </thead>
              <tbody>
                {resultados.tablaIntereses.filas.map((fila, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-3 py-2 font-medium">{fila.mes}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(fila.ccpPorcentaje, 2)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(fila.ccpAjustado, 10)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(fila.factorDiario, 12)}</td>
                    <td className="px-3 py-2 text-right">{fila.dias}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(fila.interesMensualUdis, 12)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(fila.interesMontoUdis, 11)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatCurrency(fila.interesEnPesos)}</td>
                  </tr>
                ))}
                {/* Fila de Totales */}
                <tr className="bg-blue-100 font-bold border-t-2 border-blue-600">
                  <td className="px-3 py-3">TOTALES</td>
                  <td className="px-3 py-3"></td>
                  <td className="px-3 py-3"></td>
                  <td className="px-3 py-3"></td>
                  <td className="px-3 py-3"></td>
                  <td className="px-3 py-3 text-right">
                    {formatNumber(resultados.tablaIntereses.totales.interesMensualUdis, 12)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatNumber(resultados.tablaIntereses.totales.interesMontoUdis, 11)}
                  </td>
                  <td className="px-3 py-3 text-right text-lg">
                    {formatCurrency(resultados.tablaIntereses.totales.interesEnPesos)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Verificación */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
            ✓ Verificación
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Penúltima sumatoria × UDI final:</strong>{' '}
              {formatCurrency(resultados.tablaIntereses.totales.interesMontoUdis * resultados.udiFinal)}
            </p>
            <p>
              <strong>Sumatoria última columna:</strong>{' '}
              {formatCurrency(resultados.tablaIntereses.totales.interesEnPesos)}
            </p>
          </div>
        </div>

        {/* Monto Final */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">💰 Monto Final con Intereses Acumulados</h2>
          <div className="text-5xl font-bold">
            {formatCurrency(resultados.montoFinalConInteres)}
          </div>
          <div className="mt-4 text-green-100">
            <p>Monto actualizado: {formatCurrency(resultados.montoFinal)}</p>
            <p>+ Intereses moratorios: {formatCurrency(resultados.tablaIntereses.totales.interesEnPesos)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
