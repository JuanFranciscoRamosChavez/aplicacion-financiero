// src/components/questionnaire/InvestmentSection.jsx
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InvestmentModal from './InvestmentModal';

export default function InvestmentSection({ investments, setInvestments, onConfirm }) {
  const [modalCategory, setModalCategory] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const countActive = (prefix) => 
    Object.keys(investments).filter(k => k.startsWith(prefix) && investments[k].active).length;

  const activeMX = countActive('mx_');
  const activeUS = countActive('us_');

  const handleClearAll = () => setInvestments({});

  const handleContinue = () => {
    setIsConfirmed(true);
    if (onConfirm) onConfirm();
  };

  // --- COMPONENTE DE TARJETA MINIMALISTA (ESTILO IMAGEN) ---
  const SimpleCard = ({ code, title, subtitle, count, onClick }) => {
    const isActive = count > 0;

    return (
      <div 
        onClick={onClick}
        className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer bg-white
          ${isActive 
            ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' 
            : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
          }`}
      >
        <div className="flex items-start gap-5">
          {/* Código MX / US */}
          <span className="text-xl font-medium text-slate-500 mt-1">{code}</span>
          
          {/* Textos */}
          <div>
            <h4 className={`font-bold text-lg ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
              {title}
            </h4>
            <p className="text-sm text-slate-500 font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Acción (Lado Derecho) */}
        <div className="mt-4 sm:mt-0 w-full sm:w-auto text-right">
          {isActive ? (
            <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              {count} {count === 1 ? 'Seleccionado' : 'Seleccionados'}
            </span>
          ) : (
            <div className="flex items-center justify-end gap-1 text-slate-400 font-bold text-sm group-hover:text-blue-500 transition-colors">
              <span>Configurar</span>
              <span className="text-lg leading-none">&rarr;</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="mb-6 border-l-4 border-l-blue-500 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Encabezado */}
        <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4">
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full text-sm">5</span>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">Opciones de Inversión</h3>
            <p className="text-slate-500 text-sm">
              Seleccione las categorías que conoce.
            </p>
          </div>
        </div>

        <div className="space-y-4"> {/* Espaciado vertical entre tarjetas */}
          
          <SimpleCard 
            code="MX"
            title="Mercado Nacional"
            subtitle="Cetes, Bonos, Fondos MX"
            count={activeMX}
            onClick={() => setModalCategory('MX')}
          />

          <SimpleCard 
            code="US"
            title="Mercado Internacional"
            subtitle="T-Bills, Acciones Globales"
            count={activeUS}
            onClick={() => setModalCategory('US')}
          />

          {/* Opción C: Estilo Punteado Rojo (Idéntico a imagen) */}
          <button 
            type="button"
            onClick={handleClearAll}
            className="w-full mt-4 p-4 rounded-xl border border-dashed border-red-300 bg-red-50/50 text-red-600 font-bold text-sm hover:bg-red-50 hover:border-red-400 transition-colors flex justify-center items-center gap-2"
          >
            Opción C: No conozco ninguna (Limpiar selección)
          </button>

        </div>

        {/* Botón de Confirmar (Solo aparece si no se ha confirmado) */}
        {!isConfirmed && (
          <div className="mt-8 flex justify-end pt-4 border-t border-slate-100">
            <Button onClick={handleContinue} variant="primary" className="w-full sm:w-auto">
              Confirmar y Continuar
            </Button>
          </div>
        )}
      </Card>

      <InvestmentModal 
        isOpen={!!modalCategory}
        onClose={() => setModalCategory(null)}
        category={modalCategory}
        investments={investments}
        setInvestments={setInvestments}
      />
    </>
  );
}