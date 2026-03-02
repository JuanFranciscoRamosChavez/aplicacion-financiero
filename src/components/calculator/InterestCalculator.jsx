import React, { useState } from 'react';
import InterestResultsTable from './InterestResultsTable';

export default function InterestCalculator() {
  const [formData, setFormData] = useState({
    monto: '',
    fechaInicio: '',
    fechaFinal: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultados, setResultados] = useState(null);

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
      
      console.log('Enviando petición al backend:', { monto, fechaInicio, fechaFinal });
      
      // Llamar al backend que hace todo el cálculo
      const response = await fetch(`/api/calcular-intereses?monto=${monto}&fechaInicio=${fechaInicio}&fechaFinal=${fechaFinal}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el servidor');
      }
      
      const data = await response.json();
      console.log('Respuesta del backend:', data);
      
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

          {/* Info adicional */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los datos se obtienen de la API oficial de Banxico</li>
              <li>• El cálculo usa UDIs (Unidades de Inversión)</li>
              <li>• La tasa CCP se multiplica por 1.25 según normativa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
