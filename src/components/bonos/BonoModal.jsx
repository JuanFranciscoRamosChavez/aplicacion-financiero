import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function BonoModal({ isOpen, onClose, onSelectMode }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Centro de Bonos">
      <div className="space-y-4">
        <p className="text-slate-700 mb-4 sm:mb-6 text-sm sm:text-base">
          Selecciona cómo deseas aprender sobre bonos y calcular sus valores:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Calculadoras */}
          <button
            onClick={() => onSelectMode('calculadora')}
            className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-bold text-blue-600 mb-2 text-sm sm:text-base">Calculadoras</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Calcula rentabilidad, TIR, precio y más para cada tipo de bono
            </p>
          </button>

          {/* Tutoriales */}
          <button
            onClick={() => onSelectMode('tutorial')}
            className="p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition text-left"
          >
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-bold text-green-600 mb-2 text-sm sm:text-base">Tutoriales</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Ejercicios resueltos paso a paso con explicaciones
            </p>
          </button>

          {/* Galería */}
          <button
            onClick={() => onSelectMode('galeria')}
            className="p-4 border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition text-left sm:col-span-2 md:col-span-1"
          >
            <div className="text-2xl mb-2">🖼️</div>
            <h3 className="font-bold text-purple-600 mb-2 text-sm sm:text-base">Galería</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Visualiza todos los ejercicios con sus detalles
            </p>
          </button>
        </div>
      </div>
    </Modal>
  );
}
