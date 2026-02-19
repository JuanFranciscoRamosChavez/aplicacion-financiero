// src/components/questionnaire/QuestionCard.jsx
import React from 'react';
import Card from '../ui/Card';

export default function QuestionCard({ question, selectedValue, onChange }) {
  const isQ14 = question.id === 14;
  // Si es la pregunta 14 y seleccionó "Sí" (valor 2), mostramos detalles
  const showQ14Details = isQ14 && selectedValue === 2;

  return (
    <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-4 mb-4">
        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
          {question.id}
        </span>
        <h3 className="font-semibold text-slate-800 text-lg">{question.text}</h3>
      </div>

      <div className="pl-0 md:pl-12 space-y-3">
        {question.opts.map((opt) => (
          <label 
            key={opt.v} 
            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
              selectedValue === opt.v 
                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                : 'border-slate-200 hover:bg-slate-50 hover:border-blue-200'
            }`}
          >
            <input
              type="radio"
              name={`q_${question.id}`}
              value={opt.v}
              checked={selectedValue === opt.v}
              onChange={() => onChange(question.id, opt.v)}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-slate-700">{opt.t}</span>
          </label>
        ))}

        {/* Detalle visual para Pregunta 14 (No afecta puntaje, solo registro) */}
        {showQ14Details && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in zoom-in-95">
            <p className="col-span-full text-xs font-bold text-slate-500 uppercase mb-1">Seleccione tipos de inversión:</p>
            {['Tecnología', 'Agrícola', 'Comercio', 'Infraestructura', 'Inmobiliaria', 'Otros'].map((item) => (
              <label key={item} className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer hover:text-blue-600">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}