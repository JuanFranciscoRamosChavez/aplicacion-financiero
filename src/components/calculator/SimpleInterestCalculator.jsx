import React, { useState, useMemo } from 'react';

export default function SimpleInterestCalculator() {
  const [calcType, setCalcType] = useState('monto');
  const [capital, setCapital] = useState("");
  const [monto, setMonto] = useState("");
  const [tasa, setTasa] = useState("");
  const [tasaFrecuencia, setTasaFrecuencia] = useState("anual");
  const [tiempo, setTiempo] = useState("");
  const [tiempoFrecuencia, setTiempoFrecuencia] = useState("años");

  // Conversión de periodicidades a meses para homologar
  const factorA_Meses = {
    "mensual": 1,
    "bimestral": 2,
    "trimestral": 3,
    "semestral": 6,
    "anual": 12,
    "años": 12,
    "meses": 1
  };

  const calcularResultado = () => {
    // Normalizar tasas y tiempos (Todo convertido a la misma unidad para operar, ej. a meses)
    let c = parseFloat(capital);
    let m = parseFloat(monto);
    let i = parseFloat(tasa) / 100; // Porcentaje a decimal
    let t = parseFloat(tiempo);

    if (isNaN(i)) i = 0;
    if (isNaN(t)) t = 0;

    // Homologar la tasa y el tiempo a la misma frecuencia (mensual)
    let tasaMensual = i / factorA_Meses[tasaFrecuencia];
    let tiempoMensual = t * factorA_Meses[tiempoFrecuencia];

    try {
      if (calcType === 'monto') {
        if (!c || !t || !tasa) return null;
        const res = c * (1 + (tasaMensual * tiempoMensual));
        return {
          etiqueta: "Monto (Valor Futuro) Calculado",
          valor: `$${res.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          formula: `M = ${c} * (1 + (${(tasaMensual).toFixed(4)} * ${tiempoMensual}))`
        };
      } 
      
      if (calcType === 'capital') {
        if (!m || !t || !tasa) return null;
        const res = m / (1 + (tasaMensual * tiempoMensual));
        return {
          etiqueta: "Capital (Valor Presente) Calculado",
          valor: `$${res.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          formula: `C = ${m} / (1 + (${(tasaMensual).toFixed(4)} * ${tiempoMensual}))`
        };
      }

      if (calcType === 'tasa') {
        if (!m || !c || !t) return null;
        const iMensual = ((m / c) - 1) / tiempoMensual;
        const iOriginal = iMensual * factorA_Meses[tasaFrecuencia] * 100;
        return {
          etiqueta: `Tasa de Interés ${tasaFrecuencia.charAt(0).toUpperCase() + tasaFrecuencia.slice(1)}`,
          valor: `${iOriginal.toFixed(2)}%`,
          formula: `i = ((${m}/${c}) - 1) / ${tiempoMensual} meses`
        };
      }

      if (calcType === 'tiempo') {
        if (!m || !c || !tasa) return null;
        let tMeses = ((m / c) - 1) / tasaMensual;
        let tOriginal = tMeses / factorA_Meses[tiempoFrecuencia];
        return {
          etiqueta: `Plazo Expresado en ${tiempoFrecuencia.charAt(0).toUpperCase() + tiempoFrecuencia.slice(1)}`,
          valor: `${tOriginal.toFixed(2)} ${tiempoFrecuencia}`,
          formula: `n = ((${m}/${c}) - 1) / ${(tasaMensual).toFixed(4)} (tasa descrita en meses)`
        };
      }

    } catch (e) {
      return null;
    }
  };

  const resultado = calcularResultado();

  return (
    <div className="p-6 font-sans max-w-4xl mx-auto bg-white rounded-xl shadow-lg mt-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">Calculadora de Interés Simple</h2>
      <p className="text-gray-600 mb-6">Calcula Capital, Monto, Tasa de Interés o Plazo homologando las frecuencias automáticamente.</p>
      
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <label className="block text-sm font-semibold text-blue-900 mb-2">¿Qué deseas calcular?</label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" value="monto" checked={calcType === 'monto'} onChange={(e) => setCalcType(e.target.value)} className="text-blue-600 focus:ring-blue-500" />
            <span className="text-gray-700">Monto Final</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" value="capital" checked={calcType === 'capital'} onChange={(e) => setCalcType(e.target.value)} className="text-blue-600 focus:ring-blue-500" />
            <span className="text-gray-700">Capital (Inversión Inicial)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" value="tasa" checked={calcType === 'tasa'} onChange={(e) => setCalcType(e.target.value)} className="text-blue-600 focus:ring-blue-500" />
            <span className="text-gray-700">Tasa de Interés</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" value="tiempo" checked={calcType === 'tiempo'} onChange={(e) => setCalcType(e.target.value)} className="text-blue-600 focus:ring-blue-500" />
            <span className="text-gray-700">Tiempo (Plazo)</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Renderizado condicional de variables */}
        {calcType !== 'monto' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Monto (Valor Futuro):</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input type="number" className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" />
            </div>
          </div>
        )}
        
        {calcType !== 'capital' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Capital (Valor Inicial):</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input type="number" className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="0.00" />
            </div>
          </div>
        )}

        {calcType !== 'tasa' && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tasa de Interés (%):</label>
              <div className="relative">
                <input type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" value={tasa} onChange={(e) => setTasa(e.target.value)} placeholder="0.00" />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Periodo Tasa:</label>
              <select className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-blue-500" value={tasaFrecuencia} onChange={(e) => setTasaFrecuencia(e.target.value)}>
                <option value="mensual">Mensual</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>
        )}

        {calcType !== 'tiempo' && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tiempo (Plazo):</label>
              <input type="number" step="0.1" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" value={tiempo} onChange={(e) => setTiempo(e.target.value)} placeholder="Ej: 5" />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Unidad Plazo:</label>
              <select className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-blue-500" value={tiempoFrecuencia} onChange={(e) => setTiempoFrecuencia(e.target.value)}>
                <option value="meses">Meses</option>
                <option value="años">Años</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {resultado && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex flex-col items-center">
            <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">{resultado.etiqueta}</p>
            <p className="text-4xl font-extrabold text-blue-900 mt-2">{resultado.valor}</p>
            <p className="text-xs text-gray-500 mt-4 font-mono">Lógica Interna: {resultado.formula}</p>
        </div>
      )}
    </div>
  );
}