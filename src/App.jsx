// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from './data/questions';
import { calculateRiskProfile } from './utils/scoring';
import QuestionCard from './components/questionnaire/QuestionCard';
import InvestmentSection from './components/questionnaire/InvestmentSection';
import ResultsView from './components/questionnaire/ResultsView';
import ClientData from './components/questionnaire/ClientData';

// Clave para guardar en el navegador
const STORAGE_KEY = 'risk_profile_v1_progress';

export default function App() {
  // Inicializamos estados
  const [answers, setAnswers] = useState({});
  const [investments, setInvestments] = useState({});
  const [clientData, setClientData] = useState({ name: '', age: '' });
  const [q5Confirmed, setQ5Confirmed] = useState(false);
  const [result, setResult] = useState(null);
  
  // Estado para indicar que se han cargado los datos (evita flashes raros)
  const [isLoaded, setIsLoaded] = useState(false);
  
  const bottomRef = useRef(null);

  // --- 1. EFECTO: CARGAR DATOS AL INICIAR ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Restauramos solo si existen datos válidos
        if (parsed.clientData) setClientData(parsed.clientData);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.investments) setInvestments(parsed.investments);
        if (parsed.q5Confirmed) setQ5Confirmed(parsed.q5Confirmed);
      } catch (e) {
        console.error("Error cargando datos guardados", e);
      }
    }
    setIsLoaded(true); // Marcamos que ya terminamos de cargar
  }, []);

  // --- 2. EFECTO: GUARDAR AUTOMÁTICAMENTE AL CAMBIAR ALGO ---
  useEffect(() => {
    if (isLoaded) { // Solo guardamos si ya cargamos los datos iniciales
      const stateToSave = {
        clientData,
        answers,
        investments,
        q5Confirmed
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [answers, investments, clientData, q5Confirmed, isLoaded]);

  // --- 3. EFECTO: SCROLL AUTOMÁTICO ---
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [answers, q5Confirmed, clientData.age]); 

  // --- FUNCIÓN: REINICIAR / BORRAR DATOS ---
  const handleReset = () => {
    if (confirm("¿Estás seguro de que quieres borrar todo el progreso y empezar de cero?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: parseInt(val) }));
  };

  const handleClientDataChange = (field, value) => {
    setClientData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const calculatedResult = calculateRiskProfile(answers, investments);
    setResult({ ...calculatedResult, client: clientData });
    
    // Opcional: Borramos el progreso al finalizar exitosamente
    // localStorage.removeItem(STORAGE_KEY); 
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Si no ha cargado, mostramos un spinner simple o nada
  if (!isLoaded) return null;

  if (result) {
    return <ResultsView result={result} onReset={handleReset} />;
  }

  // --- LÓGICA DE VISIBILIDAD ---
  const isClientDataDone = clientData.name.length > 0 && clientData.age.length > 0;
  const shouldShowQ1 = isClientDataDone;
  const shouldShowQ2 = answers[1] !== undefined;
  const shouldShowQ3 = answers[2] !== undefined;
  const shouldShowQ4 = answers[3] !== undefined;
  const shouldShowQ5 = answers[4] !== undefined;

  const shouldShowPostQ5 = (qId) => {
    if (qId === 6) return q5Confirmed; 
    return answers[qId - 1] !== undefined; 
  };
  const showSubmit = answers[14] !== undefined;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto">
        
        {/* Header con botón de Reiniciar */}
        <header className="mb-10 text-center animate-in slide-in-from-top-4 duration-700 relative">
          
          {/* Botón discreto para reiniciar si hay datos */}
          {(isClientDataDone || Object.keys(answers).length > 0) && (
            <button 
              onClick={handleReset}
              className="absolute top-0 right-0 text-xs text-red-400 hover:text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50 transition-colors"
              title="Borrar progreso y empezar de nuevo"
            >
              Borrar Progreso 🗑️
            </button>
          )}

          <div className="inline-block p-3 rounded-full bg-blue-100 mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Perfil de Riesgo
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Sus respuestas se guardan automáticamente.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          
          {/* PASO 0: Datos del Cliente */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ClientData data={clientData} onChange={handleClientDataChange} />
          </div>

          {/* PASO 1: Preguntas iniciales (1-4) */}
          {shouldShowQ1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <QuestionCard question={QUESTIONS[0]} selectedValue={answers[1]} onChange={handleAnswerChange} />
            </div>
          )}
          {shouldShowQ2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <QuestionCard question={QUESTIONS[1]} selectedValue={answers[2]} onChange={handleAnswerChange} />
            </div>
          )}
          {shouldShowQ3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <QuestionCard question={QUESTIONS[2]} selectedValue={answers[3]} onChange={handleAnswerChange} />
            </div>
          )}
          {shouldShowQ4 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <QuestionCard question={QUESTIONS[3]} selectedValue={answers[4]} onChange={handleAnswerChange} />
             </div>
          )}

          {/* PASO 2: Inversiones (Q5) */}
          {shouldShowQ5 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <InvestmentSection 
                investments={investments} 
                setInvestments={setInvestments}
                onConfirm={() => setQ5Confirmed(true)} 
              />
            </div>
          )}

          {/* PASO 3: Preguntas finales (6-14) */}
          {QUESTIONS.slice(4).map(q => (
            shouldShowPostQ5(q.id) && (
              <div key={q.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <QuestionCard 
                  question={q} 
                  selectedValue={answers[q.id]} 
                  onChange={handleAnswerChange} 
                />
              </div>
            )
          ))}

          {/* PASO FINAL: Botón Calcular */}
          {showSubmit && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 mt-10">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg text-sm text-yellow-800 my-6 flex gap-3 items-start">
                <span className="text-xl">⚖️</span>
                <div>
                  <strong>Cuestionario completo.</strong> Las preguntas finales influyen directamente en la clasificación legal.
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95 text-xl flex items-center justify-center gap-2"
              >
                <span>Calcular Perfil de Riesgo</span>
              </button>
            </div>
          )}
          
          <div ref={bottomRef} className="h-10"></div>

        </form>
      </div>
    </div>
  );
}
