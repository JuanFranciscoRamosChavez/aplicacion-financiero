// src/components/questionnaire/ResultsView.jsx
import React from 'react';
import Button from '../ui/Button';

export default function ResultsView({ result, onReset }) {
  if (!result) return null;

  return (
    <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 print:shadow-none print:border-none">
        
        {/* Header de Resultado */}
        <div className="bg-slate-900 text-white p-10 text-center relative overflow-hidden print:bg-white print:text-black">
          {/* Fondo decorativo (Oculto al imprimir para ahorrar tinta) */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900 print:hidden"></div>
          
          {/* DATOS DEL CLIENTE */}
          <div className="relative z-10 mb-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-white mb-1 print:text-slate-900">{result.client.name || 'Cliente'}</h1>
            <p className="text-blue-200 text-sm uppercase tracking-widest print:text-slate-500">Edad: {result.client.age} años</p>
          </div>

          <h2 className="text-xl font-light opacity-80 mb-4 relative z-10 print:text-slate-700">Perfil Asignado:</h2>
          
          {/* Badge del Perfil */}
          <div className={`inline-block px-10 py-4 rounded-full text-3xl font-bold mb-8 shadow-2xl border-4 border-white/20 relative z-10 print:border-2 print:shadow-none print:bg-transparent print:text-black ${result.colorClass.replace('bg-', 'bg-slate-800 ').replace('text-', 'text-white border-')}`}>
            {result.profile}
            {result.isSophisticated && <span className="block text-sm font-normal mt-2 text-yellow-300 tracking-wide uppercase print:text-slate-600">(Sofisticado)</span>}
          </div>

          {/* --- OPCIÓN C: TARJETA COMPACTA --- */}
<div className="max-w-sm mx-auto mt-6 relative z-10">
  <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-5 rounded-xl flex items-center justify-between shadow-xl print:bg-none print:border-slate-300 print:shadow-none">
    
    {/* Lado Izquierdo: Etiquetas */}
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse print:hidden"></span>
        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider print:text-slate-500">Resultado Oficial</p>
      </div>
      <p className="text-white font-medium text-lg print:text-black">Puntaje Acumulado</p>
    </div>

    {/* Lado Derecho: Números */}
    <div className="text-right">
      <div className="flex items-end justify-end gap-1">
        <span className="text-4xl font-bold text-white leading-none print:text-black">
          {result.score}
        </span>
        <span className="text-sm text-blue-300 font-medium mb-1 print:text-slate-500">
          /64
        </span>
      </div>
      <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded text-center ${
        result.score <= 14 ? 'bg-emerald-500/20 text-emerald-200' : 
        result.score <= 28 ? 'bg-yellow-500/20 text-yellow-200' : 'bg-red-500/20 text-red-200'
      } print:text-slate-600 print:bg-transparent print:p-0 print:text-right`}>
        {result.score <= 14 ? 'Riesgo Bajo' : result.score <= 28 ? 'Riesgo Medio' : 'Riesgo Alto'}
      </div>
    </div>

  </div>
</div>
        </div>

        {/* Cuerpo del Resultado */}
        <div className="p-8 md:p-12 bg-white">
          <div className="prose prose-slate max-w-none mb-10">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Descripción del Perfil</h3>
            <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-blue-500 pl-4 py-1 bg-slate-50 rounded-r-lg print:border-l-4 print:border-slate-800">
              {result.description}
            </p>

            {result.isSophisticated && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3 print:bg-white print:border-slate-300">
                <span className="text-2xl">⚖️</span>
                <div>
                  <h4 className="font-bold text-yellow-800 text-sm uppercase print:text-black">Nota Legal: Inversionista Sofisticado</h4>
                  <p className="text-sm text-yellow-700 mt-1 print:text-slate-600">
                    Cumple con los criterios de los Arts. 188 y 190 de la LMV. Es conocedor del mercado y los riesgos inherentes.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* MENSAJE DE AGRADECIMIENTO (SOLO IMPRESIÓN) */}
          <div className="hidden print:block mt-8 mb-12 text-center p-6 border-y-2 border-slate-100">
            <h3 className="text-xl font-bold text-slate-800">¡Gracias por su confianza!</h3>
            <p className="text-slate-500 mt-2 italic">
              Hemos completado su evaluación de perfil de riesgo. <br />
              Esta información será fundamental para guiar sus futuras decisiones de inversión.
            </p>
          </div>

          {/* BOTONES (OCULTOS AL IMPRIMIR) */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 border-t border-slate-100 pt-8 print:hidden">
            <Button onClick={() => window.print()} variant="secondary" className="w-full sm:w-auto">
              🖨️ Imprimir / Guardar PDF
            </Button>
            <Button onClick={onReset} variant="primary" className="w-full sm:w-auto">
              🔄 Iniciar Nuevo Perfil
            </Button>
          </div>
        </div>
        
        {/* FOOTER DE FIRMAS (SOLO IMPRESIÓN) */}
        <div className="hidden print:block p-12 mt-4">
          <div className="grid grid-cols-2 gap-20 mt-4">
            <div className="text-center">
              <div className="border-t border-black pt-2 font-bold text-sm uppercase">{result.client.name}</div>
              <div className="text-xs text-slate-500">Firma del Cliente</div>
            </div>
            <div className="text-center">
              <div className="border-t border-black pt-2 font-bold text-sm uppercase">&nbsp;</div>
              <div className="text-xs text-slate-500">Firma del Ejecutivo</div>
            </div>
          </div>
          <div className="text-center mt-12 text-xs text-slate-400">
            Documento generado digitalmente el {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </div>
        </div>

      </div>
    </div>
  );
} 