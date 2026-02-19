// src/components/questionnaire/InvestmentModal.jsx
import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { INSTRUMENTS } from '../../data/instruments';

export default function InvestmentModal({ isOpen, onClose, category, investments, setInvestments }) {
  if (!category) return null;

  const list = INSTRUMENTS[category];
  const title = category === 'MX' ? 'Mercado Nacional (Pesos)' : 'Mercado Internacional (Dólares)';
  const icon = category === 'MX' ? '🇲🇽' : '🇺🇸';

  const handleChange = (id, field, value) => {
    setInvestments(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value, active: true }
    }));
  };

  const toggleActive = (id, isActive) => {
    if (!isActive) {
      setInvestments(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } else {
      setInvestments(prev => ({
        ...prev,
        [id]: { active: true, exp: 'No', know: 'Nada', pct: '' }
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} icon={icon}>
      <div className="space-y-4">
        {list.map(inst => {
          const data = investments[inst.id] || { active: false, exp: 'No', know: 'Nada', pct: '' };
          
          // Detectamos si es un campo "simple" (solo porcentaje)
          const isSimpleInput = inst.id.endsWith('_otros');

          return (
            <div 
              key={inst.id} 
              className={`border rounded-lg p-4 transition-all duration-200 ${
                data.active ? 'border-blue-500 bg-blue-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Checkbox Principal */}
              <label className="flex items-start sm:items-center cursor-pointer select-none mb-0">
                <input 
                  type="checkbox" 
                  checked={data.active} 
                  onChange={(e) => toggleActive(inst.id, e.target.checked)}
                  className="mt-1 sm:mt-0 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 flex-shrink-0"
                />
                <span className={`ml-3 font-bold text-sm sm:text-base leading-tight ${data.active ? 'text-blue-700' : 'text-slate-600'}`}>
                  {inst.name}
                </span>
              </label>

              {/* Detalles (Solo visible si está activo) */}
              {data.active && (
                <div className={`pl-0 sm:pl-8 mt-4 grid gap-4 animate-in slide-in-from-top-2 ${
                  isSimpleInput ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
                }`}>
                  
                  {/* Bloques de Experiencia y Conocimiento (Ocultos para 'otros') */}
                  {!isSimpleInput && (
                    <>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Experiencia</span>
                        <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                          {['Si', 'No'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleChange(inst.id, 'exp', opt)}
                              className={`flex-1 rounded py-1 text-xs font-bold transition-all ${
                                data.exp === opt 
                                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Conocimiento</span>
                        <select 
                          value={data.know} 
                          onChange={(e) => handleChange(inst.id, 'know', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 text-sm h-[34px]"
                        >
                          {['Nada','Poco','Regular','Alto','Muy Alto'].map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Campo Porcentaje (Se expande si es 'otros') */}
                  <div className={isSimpleInput ? "w-full" : ""}>
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                      {isSimpleInput ? 'Especifique el % aproximado de inversión' : '% Inversión'}
                    </span>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={data.pct} 
                        onChange={(e) => handleChange(inst.id, 'pct', e.target.value)}
                        placeholder="0"
                        className="w-full border border-slate-200 rounded-lg p-1.5 pl-3 font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none h-[34px]"
                      />
                      <span className="absolute right-3 top-1.5 text-slate-400 text-sm">%</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end pt-4 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur py-2 -mx-4 px-4 sm:static sm:bg-transparent sm:p-0">
        <Button onClick={onClose} variant="primary" className="w-full sm:w-auto">
          Guardar Selección
        </Button>
      </div>
    </Modal>
  );
}