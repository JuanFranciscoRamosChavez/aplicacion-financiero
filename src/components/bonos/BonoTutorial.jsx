import React, { useState } from 'react';
import { BONOS_DATA } from '../../data/bonos';
import Card from '../ui/Card';

export default function BonoTutorial({ bonoSeleccionado, setBonoSeleccionado }) {
  const bono = bonoSeleccionado ? BONOS_DATA.find(b => b.id === bonoSeleccionado) : null;

  const handleSelectBono = (id) => {
    setBonoSeleccionado(id);
  };

  if (!bono) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Tutoriales de Bonos</h2>
        
        <div className="space-y-3">
          {BONOS_DATA.map((b) => (
            <button
              key={b.id}
              onClick={() => handleSelectBono(b.id)}
              className="w-full p-4 border-l-4 border-green-500 bg-white hover:bg-green-50 rounded-lg hover:shadow-md transition text-left"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-green-600 mb-1">Bono {b.id}</div>
                  <h3 className="font-semibold text-gray-800 text-lg">{b.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">{b.descripcion}</p>
                </div>
                <span className="text-2xl ml-4">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setBonoSeleccionado(null)}
        className="mb-4 text-green-600 hover:text-green-800 font-semibold"
      >
        ← Volver a tutoriales
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Lista de tutoriales */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-2 max-h-96 overflow-y-auto">
            {BONOS_DATA.map((b) => (
              <button
                key={b.id}
                onClick={() => setBonoSeleccionado(b.id)}
                className={`w-full p-3 rounded-lg text-left text-sm font-semibold transition ${
                  b.id === bono.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bono {b.id}: {b.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Encabezado */}
            <div className="mb-8 pb-6 border-b-2 border-green-200">
              <h1 className="text-3xl font-bold text-green-700 mb-2">Bono {bono.id}: {bono.nombre}</h1>
              <p className="text-gray-600 text-lg">{bono.descripcion}</p>
            </div>

            {/* Sección 1: Fórmula */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">�️ Ejercicio</h2>
              <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                <img 
                  src={`/${bono.imagen}`}
                  alt={`Bono ${bono.id}: ${bono.nombre}`}
                  className="w-full h-auto object-contain max-h-96 rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Sección 2: Fórmula */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">�📐 Fórmula</h2>
              <div className="bg-white p-4 rounded-lg border-2 border-green-200 font-mono text-lg text-center text-blue-600 overflow-x-auto">
                {bono.formula}
              </div>
            </div>

            {/* Sección 3: Parámetros */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Parámetros del Ejercicio</h2>
              <div className="bg-white p-6 rounded-lg border-l-4 border-green-500">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(bono.parametros || {}).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-2">
                      <p className="text-xs text-gray-500 uppercase font-semibold">{key.replace(/_/g, ' ')}</p>
                      <p className="text-lg font-bold text-gray-800">
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sección 4: Solución Paso a Paso */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Solución Paso a Paso</h2>
              <div className="bg-white p-6 rounded-lg border-l-4 border-blue-500 space-y-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-semibold text-blue-700 mb-2">Paso 1: Identificar los datos</p>
                  <p className="text-gray-700">Se deben identificar todos los parámetros dados en el enunciado.</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-semibold text-blue-700 mb-2">Paso 2: Aplicar la fórmula</p>
                  <p className="text-gray-700">Se aplica la fórmula específica para este tipo de bono.</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-semibold text-blue-700 mb-2">Paso 3: Calcular</p>
                  <p className="text-gray-700">Se realiza el cálculo matemático con los valores proporcionados.</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-semibold text-blue-700 mb-2">Paso 4: Interpretar resultados</p>
                  <p className="text-gray-700">Se analizan e interpretan los resultados obtenidos.</p>
                </div>
              </div>
            </div>

            {/* Sección 5: Notas Importantes */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Notas Importantes</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-3 font-bold">•</span>
                    <span>Las fórmulas pueden variar según la periodicidad de los cupones (anual, semestral, trimestral, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-3 font-bold">•</span>
                    <span>El TIR es la tasa de descuento que hace el VAN = 0</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-3 font-bold">•</span>
                    <span>Los bonos pueden tener diferentes tipos de amortización</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold">
                Descargar Tutorial PDF
              </button>
              <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold">
                Ver Calculadora
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
