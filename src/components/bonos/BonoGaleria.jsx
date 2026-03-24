import React, { useState } from 'react';
import { BONOS_DATA } from '../../data/bonos';
import Card from '../ui/Card';
import Modal from '../ui/Modal';

export default function BonoGaleria({ bonoSeleccionado, setBonoSeleccionado }) {
  const [showPreview, setShowPreview] = useState(false);
  const bono = bonoSeleccionado ? BONOS_DATA.find(b => b.id === bonoSeleccionado) : null;

  const handleSelectBono = (id) => {
    setBonoSeleccionado(id);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setBonoSeleccionado(null);
  };

  return (
    <div className="w-full">
      {/* Modal de Vista Previa */}
      {bono && showPreview && (
        <Modal 
          isOpen={showPreview} 
          onClose={handleClosePreview}
          title={`Bono ${bono.id}: ${bono.nombre}`}
        >
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="mb-4">
              <p className="text-gray-700 mb-4">{bono.descripcion}</p>
              
            {/* Imagen del ejercicio */}
            <div className="rounded-lg overflow-hidden mb-4 bg-gray-100">
              <img 
                src={`/${bono.imagen}`}
                alt={`Bono ${bono.id}: ${bono.nombre}`}
                className="w-full h-auto object-contain max-h-96"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
                <p className="text-sm text-gray-600 mb-2"><strong>Fórmula:</strong></p>
                <p className="font-mono text-blue-600">{bono.formula}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2"><strong>Tipo de Cálculo:</strong></p>
                <p className="font-semibold text-green-700 capitalize">
                  {bono.tipoCalculo.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Galería de ejercicios */}
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Galería de Ejercicios</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BONOS_DATA.map((b) => (
            <Card 
              key={b.id}
              className="cursor-pointer hover:shadow-xl transition overflow-hidden hover:scale-105 transform"
              onClick={() => handleSelectBono(b.id)}
            >
              {/* Imagen del bono */}
              <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white overflow-hidden">
                <img 
                  src={`/${b.imagen}`}
                  alt={`Bono ${b.id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si la imagen falla, mostrar un placeholder
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #60a5fa 0%, #4f46e5 100%)';
                  }}
                />
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 text-lg">{b.nombre}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {b.descripcion}
                </p>

                {/* Metadata */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {b.tipoCalculo.replace(/_/g, ' ')}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    Ejercicio {b.id}/15
                  </span>
                </div>

                {/* Botón de acción */}
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm">
                  Ver Detalle →
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen de la galería */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Resumen de Ejercicios</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{BONOS_DATA.length}</p>
              <p className="text-gray-600 text-sm">Ejercicios Totales</p>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">15</p>
              <p className="text-gray-600 text-sm">Tipos de Bonos</p>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">∞</p>
              <p className="text-gray-600 text-sm">Combinaciones Posibles</p>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">📈</p>
              <p className="text-gray-600 text-sm">Nivel de Dificultad</p>
            </div>
          </div>

          <p className="text-gray-700 mt-6 leading-relaxed">
            Esta galería contiene {BONOS_DATA.length} ejercicios prácticos sobre bonos financieros, 
            cubriendo desde conceptos básicos como precio de adquisición y rentabilidad, hasta temas 
            avanzados como deuda perpetúa y bonos con distintas frecuencias de cobro. Cada ejercicio 
            incluye el enunciado completo, parámetros específicos, la fórmula a utilizar y la solución.
          </p>
        </Card>
      </div>
    </div>
  );
}
