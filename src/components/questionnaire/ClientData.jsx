// src/components/questionnaire/ClientData.jsx
import React from 'react';
import Card from '../ui/Card';

export default function ClientData({ data, onChange }) {
  return (
    <Card className="mb-6 border-l-4 border-blue-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex gap-4 mb-4">
        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
          👤
        </span>
        <h3 className="font-semibold text-slate-800 text-lg">Datos del Cliente</h3>
      </div>

      <div className="pl-0 md:pl-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Edad</label>
          <input
            type="number"
            value={data.age}
            onChange={(e) => onChange('age', e.target.value)}
            placeholder="Ej. 30"
            min="18"
            max="120"
            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            required
          />
        </div>
      </div>
    </Card>
  );
}