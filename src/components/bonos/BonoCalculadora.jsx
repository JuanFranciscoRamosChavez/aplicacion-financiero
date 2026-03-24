import React, { useState, useEffect } from 'react';
import { BONOS_DATA } from '../../data/bonos';
import Card from '../ui/Card';
import * as bonoCalculos from '../../utils/bonoCalculos';
import { MONEDAS, MONEDAS_OPCIONES, formatearMoneda } from '../../utils/monedas';

export default function BonoCalculadora() {
  const [bonoSeleccionado, setBonoSeleccionado] = useState(1);
  const [formData, setFormData] = useState({});
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState('EUR');

  const bono = BONOS_DATA.find(b => b.id === bonoSeleccionado);

  // Resetear formData cuando cambia el bono seleccionado
  useEffect(() => {
    setFormData({});
    setResultado(null);
    setError(null);
  }, [bonoSeleccionado]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || value
    }));
  };

  const handleCalcular = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validar que estén todos los campos requeridos
      const parametrosRequeridos = Object.keys(bono.parametros || {});
      const camposFaltantes = parametrosRequeridos.filter(
        param => formData[param] === undefined || formData[param] === ''
      );

      if (camposFaltantes.length > 0) {
        throw new Error(`Por favor completa los campos: ${camposFaltantes.join(', ')}`);
      }

      let res = {};

      // Ejecutar el cálculo según el tipo de bono
      switch (bono.id) {
        case 1:
          res = bonoCalculos.calcularPrecioAdquisicion(formData);
          break;
        case 2:
          res = bonoCalculos.calcularRentabilidad(formData);
          break;
        case 3:
          res = bonoCalculos.calcularRentabilidadSemestral(formData);
          break;
        case 4:
          res = bonoCalculos.calcularTIRConPrima(formData);
          break;
        case 5:
          res = bonoCalculos.calcularPrecioSecundario(formData);
          break;
        case 6:
          res = bonoCalculos.calcularPrimaAmortizacion(formData);
          break;
        case 7:
          res = bonoCalculos.calcularNominal(formData);
          break;
        case 8:
          res = bonoCalculos.calcularDeudaPerpetua(formData);
          break;
        case 9:
          res = bonoCalculos.calcularCuponInversor(formData);
          break;
        case 10:
          res = bonoCalculos.calcularMesesTranscurridos(formData);
          break;
        case 11:
          res = bonoCalculos.calcularPrecioVenta(formData);
          break;
        case 12:
          res = bonoCalculos.calcularCuponCorrido(formData);
          break;
        case 13:
          res = bonoCalculos.calcularBonoPerpetuoSimple(formData);
          break;
        case 14:
          res = bonoCalculos.calcularBonoPerpetuoFrecuencia(formData);
          break;
        case 15:
          res = bonoCalculos.calcularDosInversiones(formData);
          break;
        default:
          // Para bonos no implementados, mostrar los datos ingresados
          res = {
            ...formData,
            descripcion: 'Cálculo completado con los parámetros ingresados'
          };
      }

      setResultado({
        ...res,
        bonoId: bono.id,
        bonoNombre: bono.nombre,
        parametrosIngresados: formData
      });
    } catch (err) {
      setError(err.message || 'Error en el cálculo');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData({});
    setResultado(null);
    setError(null);
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 py-6 sm:py-10 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6 sm:mb-10 text-center animate-in slide-in-from-top-4 duration-700">
          <div className="inline-block p-2 sm:p-3 rounded-full bg-blue-100 mb-3 sm:mb-4">
            <span className="text-3xl sm:text-4xl">📈</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight px-2">
            Calculadora de Bonos
          </h1>
          <p className="text-slate-500 mt-2 text-xs sm:text-sm px-2">
            Calcula rentabilidad, TIR, precio y más para bonos financieros
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Panel Izquierdo - Formulario */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-4 duration-700">
            <Card className="p-4 sm:p-6 lg:sticky lg:top-4">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-slate-900">Selecciona un Bono</h2>

              {/* Selector de Bono */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                  Tipo de Bono
                </label>
                <select
                  value={bonoSeleccionado}
                  onChange={(e) => setBonoSeleccionado(parseInt(e.target.value))}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
                >
                  {BONOS_DATA.map(b => (
                    <option key={b.id} value={b.id}>
                      Bono {b.id}: {b.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Moneda */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                  Moneda
                </label>
                <select
                  value={monedaSeleccionada}
                  onChange={(e) => setMonedaSeleccionada(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
                >
                  {MONEDAS_OPCIONES.map(m => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.simbolo} {m.nombre} ({m.codigo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción del Bono */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs sm:text-sm text-slate-700">{bono.descripcion}</p>
              </div>

              {/* Formulario Dinámico */}
              <form onSubmit={handleCalcular} className="space-y-3 sm:space-y-4">
                {Object.entries(bono.parametros || {}).map(([key, defaultValue]) => {
                  // Convertir camelCase a palabras legibles
                  const etiqueta = key
                    .replace(/([A-Z])/g, ' $1')
                    .toLowerCase()
                    .replace(/^./, str => str.toUpperCase())
                    .replace(/_/g, ' ');

                  return (
                    <div key={key}>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                        {etiqueta}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type={typeof defaultValue === 'number' ? 'number' : 'text'}
                        name={key}
                        placeholder={defaultValue}
                        value={formData[key] || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                        step="0.01"
                      />
                    </div>
                  );
                })}

                {/* Botones */}
                <div className="flex gap-2 sm:gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base"
                  >
                    {loading ? 'Calculando...' : 'Calcular'}
                  </button>
                  <button
                    type="button"
                    onClick={handleLimpiar}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base"
                  >
                    Limpiar
                  </button>
                </div>
              </form>

              {/* Mensaje de Error */}
              {error && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-700 font-semibold">⚠️ {error}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Panel Derecho - Resultados */}
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-right-4 duration-700">
            {resultado ? (
              <Card className="p-8 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-blue-200">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Resultado</h2>
                    <p className="text-sm text-slate-600 mt-1">{resultado.bonoNombre}</p>
                  </div>
                  <div className="text-4xl">✓</div>
                </div>

                {/* Resultado Principal */}
                <div className="bg-white p-6 rounded-lg border-2 border-blue-300 mb-6">
                  <p className="text-slate-600 text-sm uppercase font-bold mb-2">Resultado Principal</p>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold text-blue-600">
                      {resultado.descripcion}
                    </p>
                    <span className="text-lg text-slate-500 font-semibold">
                      {MONEDAS[monedaSeleccionada].simbolo}
                    </span>
                  </div>
                </div>

                {/* Todos los Valores Calculados */}
                <div className="space-y-2 mb-6">
                  {Object.entries(resultado)
                    .filter(([key]) => !['bonoId', 'bonoNombre', 'parametrosIngresados', 'descripcion'].includes(key))
                    .map(([key, value]) => {
                      // Convertir camelCase a palabras legibles
                      const etiqueta = key
                        .replace(/([A-Z])/g, ' $1')
                        .toLowerCase()
                        .replace(/^./, str => str.toUpperCase())
                        .replace(/_/g, ' ');
                      
                      // Determinar si el valor debe formatearse con símbolo de moneda
                      // Los campos de moneda típicamente contienen: precio, nominal, cupón, valor, etc.
                      const esValorMonetario = /precio|nominal|cupon|d[íi]a|valor|rentabilidad|tir|gan|perd|total|anual|mensual|corrido/i.test(key);
                      
                      let valorFormateado = value;
                      if (esValorMonetario && typeof value === 'string') {
                        // Si ya tiene símbolo € o similar, reemplaza
                        if (value.includes('€') || value.includes('$') || value.includes('£')) {
                          valorFormateado = value.replace(/€|\$|£/, MONEDAS[monedaSeleccionada].simbolo);
                        } else if (!/[a-z]|%/i.test(value)) {
                          // Si es un número sin unidades, añade símbolo de moneda
                          valorFormateado = `${MONEDAS[monedaSeleccionada].simbolo}${value}`;
                        }
                      }
                      
                      return (
                        <div key={key} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200 hover:shadow-md transition">
                          <span className="text-slate-700 font-semibold">{etiqueta}</span>
                          <span className="text-slate-900 font-bold bg-blue-50 px-4 py-1.5 rounded text-sm">{valorFormateado}</span>
                        </div>
                      );
                    })}
                </div>

                {/* Parámetros Ingresados */}
                <div className="bg-slate-100 p-5 rounded-lg border border-slate-300">
                  <p className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Parámetros Utilizados</p>
                  <div className="space-y-2">
                    {Object.entries(resultado.parametrosIngresados).map(([key, value]) => {
                      // Convertir camelCase a palabras legibles
                      const etiqueta = key
                        .replace(/([A-Z])/g, ' $1')
                        .toLowerCase()
                        .replace(/^./, str => str.toUpperCase())
                        .replace(/_/g, ' ');
                      
                      // Determinar si el valor debe formatearse con símbolo de moneda
                      const esValorMonetario = /precio|nominal|cupon|capital|valor|inversor|pago|compra|adquisi/i.test(key);
                      
                      let valorFormateado = value;
                      if (esValorMonetario && typeof value === 'number') {
                        valorFormateado = `${MONEDAS[monedaSeleccionada].simbolo}${value.toFixed(2)}`;
                      }
                      
                      return (
                        <div key={key} className="flex justify-between items-center p-2.5 bg-white rounded border border-slate-200 hover:bg-slate-50 transition">
                          <span className="text-slate-700 font-medium text-sm">{etiqueta}</span>
                          <span className="text-slate-900 font-bold bg-slate-100 px-3 py-1 rounded text-sm">{valorFormateado}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botón de Descarga (Futuro) */}
                <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition">
                  📥 Descargar como PDF
                </button>
              </Card>
            ) : (
              <Card className="p-12 bg-slate-50 flex items-center justify-center min-h-96 border-2 border-dashed border-slate-300">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-30">📊</div>
                  <p className="text-lg text-slate-500 font-semibold">
                    Ingresa los datos y presiona "Calcular"
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Los resultados aparecerán aquí
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

