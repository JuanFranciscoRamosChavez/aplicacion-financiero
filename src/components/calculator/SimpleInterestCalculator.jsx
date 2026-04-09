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
    <div className="p-8 font-sans max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl mt-8 border border-gray-100 transition-all duration-300">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-3 tracking-tight">
          Calculadora de Interés Simple
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Resuelve ejercicios de matemáticas financieras calculando Capital, Monto, Tasa de Interés o Plazo. Las frecuencias se homologan automáticamente.
        </p>
      </div>
      
      <div className="mb-10 p-1 bg-gray-50 rounded-xl inline-flex flex-wrap justify-center w-full shadow-inner">
        {[
          { id: 'monto', label: '💰 Monto Final' },
          { id: 'capital', label: '🏦 Capital Inicial' },
          { id: 'tasa', label: '📊 Tasa de Interés' },
          { id: 'tiempo', label: '⏳ Tiempo (Plazo)' }
        ].map(({ id, label }) => (
          <label key={id} className={`flex-1 text-center py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 font-semibold text-sm ${calcType === id ? 'bg-white text-blue-700 shadow-md transform scale-105 ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
            <input type="radio" value={id} checked={calcType === id} onChange={(e) => setCalcType(e.target.value)} className="hidden" />
            {label}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-2xl border border-gray-100">
        {calcType !== 'monto' && (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Monto (Valor Futuro)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium sm:text-lg">$</span>
              </div>
              <input type="number" className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" />
            </div>
          </div>
        )}
        
        {calcType !== 'capital' && (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Capital (Valor Inicial)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium sm:text-lg">$</span>
              </div>
              <input type="number" className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="0.00" />
            </div>
          </div>
        )}

        {calcType !== 'tasa' && (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Tasa de Interés</label>
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <input type="number" step="0.01" className="block w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" value={tasa} onChange={(e) => setTasa(e.target.value)} placeholder="0.00" />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium">%</span>
                </div>
              </div>
              <select className="w-1/3 py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" value={tasaFrecuencia} onChange={(e) => setTasaFrecuencia(e.target.value)}>
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
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Tiempo (Plazo)</label>
            <div className="flex gap-3">
              <input type="number" step="0.1" className="block flex-1 pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" value={tiempo} onChange={(e) => setTiempo(e.target.value)} placeholder="Ej: 5" />
              <select className="w-1/3 py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" value={tiempoFrecuencia} onChange={(e) => setTiempoFrecuencia(e.target.value)}>
                <option value="meses">Meses</option>
                <option value="años">Años</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {resultado && (
        <div className="mt-10 p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl shadow-xl border border-blue-700 flex flex-col items-center text-center transform transition-all duration-500 hover:scale-[1.02]">
            <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2 opacity-90">{resultado.etiqueta}</p>
            <p className="text-5xl font-black text-white mt-1 mb-4 drop-shadow-md">{resultado.valor}</p>
            <div className="px-6 py-3 bg-black/20 rounded-lg">
              <p className="text-sm text-blue-100 font-mono tracking-tight">Lógica: {resultado.formula}</p>
            </div>
        </div>
      )}
    </div>
  );
}