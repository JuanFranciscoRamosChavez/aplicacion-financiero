import React, { useState, useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// --- MOTOR MATEMÁTICO (Lógica pura) ---
function generarTablaActuarial(edadInicial, radix, interes, qxArray) {
    let tabla = [];
    let l_actual = radix;

    // FASE 1: Recorrido hacia adelante
    for (let i = 0; i < qxArray.length; i++) {
        let x = edadInicial + i;
        let qx = qxArray[i];

        let px = 1 - qx;
        let dx = l_actual * qx;

        let vx = Math.pow(1 + interes, -x);
        let vx1 = Math.pow(1 + interes, -(x + 1));

        let Dx = l_actual * vx;
        let Cx = dx * vx1;

        tabla.push({
            x: x,
            qx: qx,
            px: px,
            lx: l_actual,
            dx: dx,
            vx: vx,
            vx1: vx1,
            Dx: Dx,
            Cx: Cx,
            Nx: 0, 
            Mx: 0,
            Sx: 0,
            Rx: 0  
        });

        l_actual = l_actual - dx;
    }

    // FASE 2: Recorrido hacia atrás (Sumatorias primer orden)
    let sumaDx = 0;
    let sumaCx = 0;

    for (let i = tabla.length - 1; i >= 0; i--) {
        sumaDx += tabla[i].Dx;
        sumaCx += tabla[i].Cx;

        tabla[i].Nx = sumaDx;
        tabla[i].Mx = sumaCx;
    }

    // FASE 3: Recorrido hacia atrás (Sumatorias segundo orden)
    let sumaNx = 0;
    let sumaMx = 0;

    for (let i = tabla.length - 1; i >= 0; i--) {
        sumaNx += tabla[i].Nx;
        sumaMx += tabla[i].Mx;

        tabla[i].Sx = sumaNx;
        tabla[i].Rx = sumaMx;
    }

    return tabla;
}

// --- INTERFAZ DEL COMPONENTE (Frontend) ---
export default function ActuarialCalculator() {
    // 1. Estado de las variables base (usamos strings para poder borrar el input por completo)
    const [edad, setEdad] = useState("95");
    const [radix, setRadix] = useState("1000");
    const [interes, setInteres] = useState("5"); // Ahora lo manejamos como porcentaje (5 = 5%)
    
    // Manejamos q(x) como una cadena de texto separada por comas para facilitar la entrada masiva
    const [qxText, setQxText] = useState("0.20, 0.25, 0.60, 0.95, 1.0");

    // 2. Estado derivado: La tabla se recalcula automáticamente si cambian los inputs
    const tablaResultados = useMemo(() => {
        // Convertir la cadena de texto a un arreglo de números
        const qxArray = qxText
            .split(',')
            .map(num => parseFloat(num.trim()))
            .filter(num => !isNaN(num));

        if (qxArray.length === 0) return [];

        // Parseamos los valores de estado con un fallback seguro
        const currentEdad = Number(edad) || 0;
        const currentRadix = Number(radix) || 0;
        const currentInteres = Number(interes) || 0;

        // Dividimos el interés entre 100 para mandarlo como decimal al motor matemático
        return generarTablaActuarial(currentEdad, currentRadix, currentInteres / 100, qxArray);
    }, [edad, radix, interes, qxText]);

    // Función auxiliar para formatear decimales en la tabla
    const formatNum = (num, decimals = 4) => Number(num).toFixed(decimals);

    // 3. Estado de la sección de Ejercicios (Boceto)
    const [ejTipo, setEjTipo] = useState('anualidad_anticipada_temporal');
    const [ejX, setEjX] = useState("95");
    const [ejN, setEjN] = useState("2");
    const [ejM, setEjM] = useState("4");
    const [ejSecuencia, setEjSecuencia] = useState("p95, q97");
    const [secParams, setSecParams] = useState({}); // Almacena { m, n } para cada índice
    const [menuAbierto, setMenuAbierto] = useState(false);

    const MENU_OPCIONES = [
        {
            grupo: "Anualidades Temporales",
            items: [
                { id: "anualidad_anticipada_temporal", label: "Anualidad Anticipada Temporal", notation: "ä_{x:\\overline{n}|}" },
                { id: "anualidad_vencida_temporal", label: "Anualidad Vencida Temporal", notation: "a_{x:\\overline{n}|}" },
                { id: "anualidad_anticipada_temporal_diferida", label: "Anualidad Anticipada Temp. Diferida", notation: "{}_{m|}\\ddot{a}_{x:\\overline{n}|}" },
                { id: "anualidad_vencida_temporal_diferida", label: "Anualidad Vencida Temp. Diferida", notation: "{}_{m|}a_{x:\\overline{n}|}" }
            ]
        },
        {
            grupo: "Anualidades Vitalicias",
            items: [
                { id: "anualidad_anticipada_vitalicia", label: "Anualidad Anticipada Vitalicia", notation: "\\ddot{a}_x" },
                { id: "anualidad_vencida_vitalicia", label: "Anualidad Vencida Vitalicia", notation: "a_x" },
                { id: "anualidad_anticipada_vitalicia_diferida", label: "Anualidad Anticipada Vitalicia Diferida", notation: "{}_{m|}\\ddot{a}_x" },
                { id: "anualidad_vencida_vitalicia_diferida", label: "Anualidad Vencida Vitalicia Diferida", notation: "{}_{m|}a_x" }
            ]
        },
        {
            grupo: "Mortalidad y Supervivencia",
            items: [
                { id: "probabilidad_supervivencia", label: "Tasa de Supervivencia", notation: "{}_{n}p_x" },
                { id: "probabilidad_diferida_muerte", label: "Tasa de Mortalidad Diferida", notation: "{}_{m|}q_x" },
                { id: "probabilidad_diferida_temporal_muerte", label: "Tasa de Mortalidad Diferida Temporal", notation: "{}_{m|n}q_x" },
                { id: "probabilidad_desglose_multiplicativo", label: "Desglose Personalizado (Secuencia)", notation: "(p_x)(q_y)\\dots" }
            ]
        }
    ];

    // Helper para obtener el label actual
    const opcionActual = MENU_OPCIONES.flatMap(g => g.items).find(i => i.id === ejTipo);

    const resultadoEjercicio = useMemo(() => {
        if (tablaResultados.length === 0) return null;
        
        const x = Number(ejX);
        const n = Number(ejN);
        const m = Number(ejM);
        
        if (isNaN(x) || isNaN(n) || isNaN(m)) return null;

        const getFil = (edad) => tablaResultados.find(f => f.x === edad);
        const filaX = getFil(x);
        
        if (!filaX) return { error: "Edad x no encontrada en la tabla." };

        if (ejTipo === 'anualidad_anticipada_temporal') {
            const filaXN = getFil(x + n) || { Nx: 0 }; 
            const num = filaX.Nx - filaXN.Nx;
            const den = filaX.Dx;
            if (den === 0) return { error: "D(x) es 0." };
            const res = num / den;
            return {
                titulo: "Anualidad Anticipada Temporal",
                simboloPrin: `\\ddot{a}_{${x}:\\overline{${n}}|}` ,
                formNum: `N_{${x}} - N_{${x+n}}`,
                formDen: `D_{${x}}`,
                sustNum: `${formatNum(filaX.Nx)} - ${formatNum(filaXN.Nx)}`,
                sustDen: `${formatNum(filaX.Dx)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'anualidad_vencida_temporal') {
            const filaX1 = getFil(x + 1) || { Nx: 0 };
            const filaXN1 = getFil(x + n + 1) || { Nx: 0 }; 
            const num = filaX1.Nx - filaXN1.Nx;
            const den = filaX.Dx;
            if (den === 0) return { error: "D(x) es 0." };
            const res = num / den;
            return {
                titulo: "Anualidad Vencida Temporal",
                simboloPrin: `a_{${x}:\\overline{${n}}|}` ,
                formNum: `N_{${x+1}} - N_{${x+n+1}}`,
                formDen: `D_{${x}}`,
                sustNum: `${formatNum(filaX1.Nx)} - ${formatNum(filaXN1.Nx)}`,
                sustDen: `${formatNum(filaX.Dx)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'anualidad_anticipada_vitalicia') {
            const num = filaX.Nx;
            const den = filaX.Dx;
            if (den === 0) return { error: "D(x) es 0." };
            const res = num / den;
            return {
                titulo: "Anualidad Anticipada Vitalicia",
                simboloPrin: `\\ddot{a}_{${x}}`,
                formNum: `N_{${x}}`,
                formDen: `D_{${x}}`,
                sustNum: `${formatNum(filaX.Nx)}`,
                sustDen: `${formatNum(filaX.Dx)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'anualidad_vencida_vitalicia') {
            const filaX1 = getFil(x + 1) || { Nx: 0 };
            const num = filaX1.Nx;
            const den = filaX.Dx;
            if (den === 0) return { error: "D(x) es 0." };
            const res = num / den;
            return {
                titulo: "Anualidad Vencida Vitalicia",
                simboloPrin: `a_{${x}}`,
                formNum: `N_{${x+1}}`,
                formDen: `D_{${x}}`,
                sustNum: `${formatNum(filaX1.Nx)}`,
                sustDen: `${formatNum(filaX.Dx)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'anualidad_anticipada_temporal_diferida') {
            const filaXM = getFil(x + m) || { Nx: 0 }; 
            const filaXMN = getFil(x + m + n) || { Nx: 0 }; 
            const num = filaXM.Nx - filaXMN.Nx;
            const den = filaX.Dx;
            if (den === 0) return { error: "D(x) es 0." };
            const res = num / den;
            return {
                titulo: "Anualidad Anticipada Temporal Diferida",
                simboloPrin: `{}_{${m}|}\\ddot{a}_{${x}:\\overline{${n}}|}` ,
                formNum: `N_{${x+m}} - N_{${x+m+n}}`,
                formDen: `D_{${x}}`,
                sustNum: `${formatNum(filaXM.Nx)} - ${formatNum(filaXMN.Nx)}`,
                sustDen: `${formatNum(filaX.Dx)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'anualidad_vencida_temporal_diferida') {
            const filaXM1 = getFil(x + m + 1) || { Nx: 0 }; 
            const filaXMN1 = getFil(x + m + n + 1) || { Nx: 0 }; 
            const num = filaXM1.Nx - filaXMN1.Nx;
            const den = filaX.Dx;
            if (den === 0) return { error: "D(x) es 0." };
            const res = num / den;
            return {
                titulo: "Anualidad Vencida Temporal Diferida",
                simboloPrin: `{}_{${m}|}a_{${x}:\\overline{${n}}|}` ,
                formNum: `N_{${x+m+1}} - N_{${x+m+n+1}}`,
                formDen: `D_{${x}}`,
                sustNum: `${formatNum(filaXM1.Nx)} - ${formatNum(filaXMN1.Nx)}`,
                sustDen: `${formatNum(filaX.Dx)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'anualidad_anticipada_vitalicia_diferida') {
            const filaXM = getFil(x + m) || { Nx: 0 }; 
            const num = filaXM.Nx;
            const den = filaX.Dx;
            if (den === 0) return { error: "D(x) es 0." };
            const res = num / den;
            return {
                titulo: "Anualidad Anticipada Vitalicia Diferida",
                simboloPrin: `{}_{${m}|}\\ddot{a}_{${x}}` ,
                formNum: `N_{${x+m}}`,
                formDen: `D_{${x}}`,
                sustNum: `${formatNum(filaXM.Nx)}`,
                sustDen: `${formatNum(filaX.Dx)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'anualidad_vencida_vitalicia_diferida') {
            const filaXM1 = getFil(x + m + 1) || { Nx: 0 }; 
            const num = filaXM1.Nx;
            const den = filaX.Dx;
            if (den === 0) return { error: "D(x) es 0." };
            const res = num / den;
            return {
                titulo: "Anualidad Vencida Vitalicia Diferida",
                simboloPrin: `{}_{${m}|}a_{${x}}` ,
                formNum: `N_{${x+m+1}}`,
                formDen: `D_{${x}}`,
                sustNum: `${formatNum(filaXM1.Nx)}`,
                sustDen: `${formatNum(filaX.Dx)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'probabilidad_diferida_muerte') {
            const filaXM = getFil(x + m) || { lx: 0 };
            const filaXM1 = getFil(x + m + 1) || { lx: 0 };
            const num = filaXM.lx - filaXM1.lx;
            const den = filaX.lx;
            if (den === 0) return { error: "l(x) es 0." };
            const res = num / den;
            return {
                titulo: "Tasa de Mortalidad Diferida",
                simboloPrin: `{}_{${m}|}q_{${x}}`,
                formNum: `l_{${x+m}} - l_{${x+m+1}}`,
                formDen: `l_{${x}}`,
                sustNum: `${formatNum(filaXM.lx, 2)} - ${formatNum(filaXM1.lx, 2)}`,
                sustDen: `${formatNum(filaX.lx, 2)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'probabilidad_diferida_temporal_muerte') {
            const filaXM = getFil(x + m) || { lx: 0 };
            const filaXMN = getFil(x + m + n) || { lx: 0 };
            const num = filaXM.lx - filaXMN.lx;
            const den = filaX.lx;
            if (den === 0) return { error: "l(x) es 0." };
            const res = num / den;
            return {
                titulo: "Tasa de Mortalidad Diferida Temporal",
                simboloPrin: `{}_{${m}|${n}}q_{${x}}`,
                formNum: `l_{${x+m}} - l_{${x+m+n}}`,
                formDen: `l_{${x}}`,
                sustNum: `${formatNum(filaXM.lx, 2)} - ${formatNum(filaXMN.lx, 2)}`,
                sustDen: `${formatNum(filaX.lx, 2)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'probabilidad_supervivencia') {
            const filaXN = getFil(x + n) || { lx: 0 };
            const num = filaXN.lx;
            const den = filaX.lx;
            if (den === 0) return { error: "l(x) es 0." };
            const res = num / den;
            return {
                titulo: "Tasa de Supervivencia",
                simboloPrin: `{}_{${n}}p_{${x}}`,
                formNum: `l_{${x+n}}`,
                formDen: `l_{${x}}`,
                sustNum: `${formatNum(filaXN.lx, 2)}`,
                sustDen: `${formatNum(filaXN.lx, 2)}`,
                resultado: formatNum(res, 8)
            };
        }

        if (ejTipo === 'probabilidad_desglose_multiplicativo') {
            let res = 1;
            let simPrinStr = "";
            let formStr = "";
            let sustStr = "";

            const tokens = ejSecuencia.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
            
            if (tokens.length === 0) return { error: "Ingresa una secuencia válida (ej: p95, q97)." };

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                // Parseamos bases, e.g. p95, q96 (si trae prefijo lo ignoraremos a favor de los inputs m/n dinámicos)
                // Aunque seguiremos permitiendo mpx de base si está escrito.
                const match = token.match(/^(\d*)([pq])(\d+)$/i);
                
                if (!match) {
                    return { error: `Elemento '${token}' inválido. Usa formato px o qx (ej: p95, q97).` };
                }

                let tipo = match[2].toLowerCase(); // p o q
                let x = parseInt(match[3], 10); // edad
                
                // Leemos m y n configurados o tomamos defaults (m=0, n=1)
                const configParams = secParams[i] || {};
                let m = configParams.m !== undefined && configParams.m !== "" ? parseInt(configParams.m, 10) : 0;
                let n = configParams.n !== undefined && configParams.n !== "" ? parseInt(configParams.n, 10) : 1;

                if (isNaN(m)) m = 0;
                if (isNaN(n)) n = 1;

                // Construcción del símbolo principal basado en m, n
                let preO = "";
                if (m > 0 && n > 1) {
                    preO = `{}_{${m}|${n}}`;
                } else if (m > 0 && n === 1) {
                    preO = `{}_{${m}|}`;
                } else if (m === 0 && n > 1) {
                    preO = `{}_{${n}}`;
                }

                simPrinStr += `(${preO}${tipo}_{${x}}) \\cdot `;

                // Resolvemos l_x original
                const l_x = getFil(x)?.lx;
                if (!l_x) return { error: `Edad ${x} no existe en la tabla.` };

                if (tipo === 'p') {
                    // m|n px no es estándar, suele calcularse como l_{x+m+n} / l_{x+m} * l_{x+m}/l_x
                    // Pero asumiendo la supervivencia diferida básica: sobrevive m y luego sobrevive n 
                    // => l_{x+m+n} / l_x
                    const l_xmn = getFil(x + m + n)?.lx;
                    if (!l_xmn) return { error: `Edad ${x + m + n} no existe en la tabla.` };
                    
                    formStr += `\\left( \\frac{l_{${x + m + n}}}{l_{${x}}} \\right) \\cdot `;
                    sustStr += `\\left( \\frac{${formatNum(l_xmn, 0)}}{${formatNum(l_x, 0)}} \\right) \\cdot `;
                    res *= (l_xmn / l_x);
                    
                } else {
                    // m|n qx => fallece entre x+m y x+m+n => (l_{x+m} - l_{x+m+n}) / l_x
                    const l_xm = getFil(x + m)?.lx;
                    const l_xmn = getFil(x + m + n)?.lx;
                    
                    if (l_xm === undefined || l_xmn === undefined) {
                        return { error: `Faltan datos de l_x para calcular el fallecimiento en ese rango.` };
                    }
                    
                    formStr += `\\left( \\frac{l_{${x + m}} - l_{${x + m + n}}}{l_{${x}}} \\right) \\cdot `;
                    sustStr += `\\left( \\frac{${formatNum(l_xm, 0)} - ${formatNum(l_xmn, 0)}}{${formatNum(l_x, 0)}} \\right) \\cdot `;
                    res *= ((l_xm - l_xmn) / l_x);
                }
            }

            // Quitar el último ' \cdot '
            simPrinStr = simPrinStr.slice(0, -7);
            formStr = formStr.slice(0, -7);
            sustStr = sustStr.slice(0, -7);

            return {
                titulo: "Desglose Multiplicativo Personalizado",
                simboloPrin: simPrinStr,
                formNum: formStr, // Mostrar fórmula en nivel superior
                formDen: null, // Como es multiplicativo, lo dejamos nulo y renderizamos sobre formNum todo
                sustNum: sustStr,
                sustDen: null,
                resultado: formatNum(res, 8)
            };
        }
        
        return null;
    }, [tablaResultados, ejTipo, ejX, ejN, ejM, ejSecuencia, secParams]);

    // Manejador que permite dejar el input vacío (string vacío) o guardar el número
    const handleNumberChange = (setter) => (e) => {
        const val = e.target.value;
        setter(val === '' ? '' : val);
    };

    return (
        <div className="p-6 font-sans max-w-6xl mx-auto bg-white rounded-xl shadow-lg mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Calculadora Actuarial Dinámica</h2>
            
            {/* Panel de Configuración */}
            <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Edad Inicial (x):</label>
                    <input 
                        type="number" 
                        value={edad} 
                        onChange={handleNumberChange(setEdad)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Radix Inicial (l_x):</label>
                    <input 
                        type="number" 
                        value={radix} 
                        onChange={handleNumberChange(setRadix)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tasa de Interés (%) i:</label>
                    <input 
                        type="number" 
                        step="0.01"
                        value={interes} 
                        onChange={handleNumberChange(setInteres)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Probabilidades de Muerte q(x) separadas por coma:</label>
                <textarea 
                    value={qxText} 
                    onChange={(e) => setQxText(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ejemplo: 0.20, 0.25, 0.60, 0.95, 1.0"
                />
            </div>

            {/* Tabla de Resultados */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full border-collapse text-right text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border-b-2 border-gray-200 p-3 text-center font-bold text-gray-700">Edad (x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">q(x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">p(x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">l(x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">d(x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">VP^x</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">D(x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">N(x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">S(x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">C(x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">M(x)</th>
                            <th className="border-b-2 border-gray-200 p-3 font-bold text-gray-700">R(x)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tablaResultados.map((fila) => (
                            <tr key={fila.x} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 font-semibold text-center border-r border-gray-100">{fila.x}</td>
                                <td className="p-3 border-r border-gray-100">{formatNum(fila.qx)}</td>
                                <td className="p-3 border-r border-gray-100">{formatNum(fila.px)}</td>
                                <td className="p-3 border-r border-gray-100">{formatNum(fila.lx, 2)}</td>
                                <td className="p-3 border-r border-gray-100">{formatNum(fila.dx, 2)}</td>
                                <td className="p-3 border-r border-gray-100">{formatNum(fila.vx)}</td>
                                <td className="p-3 border-r border-gray-100 font-semibold text-blue-700">{formatNum(fila.Dx)}</td>
                                <td className="p-3 border-r border-gray-100 font-semibold text-blue-700">{formatNum(fila.Nx)}</td>
                                <td className="p-3 border-r border-gray-100 font-semibold text-indigo-700">{formatNum(fila.Sx)}</td>
                                <td className="p-3 border-r border-gray-100 font-semibold text-red-700">{formatNum(fila.Cx)}</td>
                                <td className="p-3 border-r border-gray-100 font-semibold text-red-700">{formatNum(fila.Mx)}</td>
                                <td className="p-3 font-semibold text-rose-700">{formatNum(fila.Rx)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* SECCIÓN DE EJERCICIOS */}
            <div className="mt-10 border border-indigo-100 rounded-2xl p-8 shadow-md bg-gradient-to-br from-indigo-50 to-white relative overflow-visible">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-indigo-900 tracking-tight">Resolutor de Ejercicios Inteligente</h3>
                </div>
                
                <div className="flex flex-col gap-6 mb-8 relative">
                    {/* Menú Custom Profesonal */}
                    <div className="w-full relative z-20">
                        <label className="block text-sm font-bold text-indigo-800 mb-2 uppercase tracking-wider">Categoría y Fórmula:</label>
                        
                        {/* Selector (Botón) */}
                        <button 
                            type="button"
                            onClick={() => setMenuAbierto(!menuAbierto)}
                            className="w-full flex flex-col sm:flex-row sm:items-center justify-between text-left px-5 py-4 bg-white border-2 border-indigo-100 hover:border-indigo-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-gray-800 group gap-3 sm:gap-0"
                        >
                            <span>
                                <span className="block text-xs text-indigo-500 font-bold uppercase mb-1">
                                    {MENU_OPCIONES.find(g => g.items.some(i => i.id === ejTipo))?.grupo}
                                </span>
                                <span className="text-base sm:text-lg block leading-tight">{opcionActual?.label}</span>
                            </span>
                            <span className="bg-indigo-100 text-indigo-800 px-3 py-2 sm:py-1 rounded-md sm:ml-3 text-sm flex-shrink-0 border border-indigo-200 group-hover:bg-indigo-500 group-hover:text-white transition-colors w-full sm:w-auto text-center">
                                <InlineMath math={opcionActual?.notation} />
                            </span>
                        </button>

                        {/* Panel del Menú Desplegable (Estilo Mega Menu) */}
                        {menuAbierto && (
                            <div className="absolute top-full left-0 mt-3 w-full bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden" 
                                 onMouseLeave={() => setMenuAbierto(false)}>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto">
                                    {MENU_OPCIONES.map((grupo) => (
                                        <div key={grupo.grupo} className="flex flex-col space-y-1">
                                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">{grupo.grupo}</h4>
                                            {grupo.items.map((item) => {
                                                const activo = item.id === ejTipo;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setEjTipo(item.id);
                                                            setMenuAbierto(false);
                                                        }}
                                                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl text-left transition-all gap-2 sm:gap-0 ${
                                                            activo 
                                                            ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' 
                                                            : 'bg-transparent text-gray-700 hover:bg-indigo-50 hover:text-indigo-900 border border-transparent hover:border-indigo-100'
                                                        }`}
                                                    >
                                                        <span className="text-sm font-semibold sm:pr-2 leading-tight">{item.label}</span>
                                                        <span className={`text-xs sm:ml-auto inline-block p-1.5 sm:p-1 rounded-md whitespace-nowrap sm:min-w-[40px] text-center w-full sm:w-auto ${activo ? 'bg-indigo-800 text-indigo-100' : 'bg-white text-indigo-600 shadow-sm border border-gray-200'}`}>
                                                            <InlineMath math={item.notation} />
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-50 px-6 py-4 text-xs text-gray-500 flex justify-between items-center border-t border-gray-100">
                                    <span className="hidden sm:inline">Selecciona la fórmula a resolver y reemplazará la notación.</span>
                                    <button onClick={() => setMenuAbierto(false)} className="font-bold text-indigo-600 hover:text-indigo-800 ml-auto p-2">Cerrar ✕</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Inputs de Variables (Bolas de Datos) */}
                    <div className="flex flex-wrap gap-2 sm:gap-6 p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-indigo-50 z-10 w-full justify-center items-center shadow-sm">
                        
                        {ejTipo === 'probabilidad_desglose_multiplicativo' ? (
                            <div className="w-full flex flex-col gap-4">
                                <div className="flex-1 w-full min-w-[200px] sm:min-w-[250px]">
                                    <label className="block text-[10px] sm:text-xs font-bold text-indigo-500 mb-1 uppercase focus-within:text-indigo-700">Secuencia de Vidas</label>
                                    <input 
                                        type="text" value={ejSecuencia} onChange={(e) => setEjSecuencia(e.target.value)}
                                        placeholder="Ej: p95, q96 (Presiona Enter/Espacio para agregar variables abajo)"
                                        className="w-full px-4 py-2 sm:py-3 border-2 border-indigo-100 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-lg sm:text-xl font-bold text-indigo-900 shadow-sm transition-all"
                                    />
                                </div>
                                
                                {ejSecuencia.split(',').map(s => s.trim()).filter(s => s).length > 0 && (
                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 w-full">
                                        <div className="text-xs font-bold text-indigo-800 mb-3 uppercase tracking-wide border-b border-indigo-200 pb-2">Configurar periodos por vida</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {ejSecuencia.split(',').map(s => s.trim()).filter(s => s).map((token, index) => {
                                                const match = token.match(/^(\d*)([pq])(\d+)$/i);
                                                const isValid = !!match;
                                                const tipo = isValid ? match[2].toLowerCase() : '';
                                                const x = isValid ? match[3] : '';

                                                return (
                                                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-indigo-50 relative">
                                                        <div className="absolute -top-3 left-4 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow">
                                                            {isValid ? `${token}` : 'Inválido'}
                                                        </div>
                                                        <div className="mt-3 flex gap-2 w-full">
                                                            <div className="flex-1">
                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">Difer. (m)</label>
                                                                <input 
                                                                    type="number" placeholder="m| (0)"
                                                                    value={secParams[index]?.m !== undefined ? secParams[index]?.m : ""}
                                                                    onChange={(e) => setSecParams(prev => ({...prev, [index]: { ...prev[index], m: e.target.value }}))}
                                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:border-indigo-400"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">Plazo (n)</label>
                                                                <input 
                                                                    type="number" placeholder="n (1)"
                                                                    value={secParams[index]?.n !== undefined ? secParams[index]?.n : ""}
                                                                    onChange={(e) => setSecParams(prev => ({...prev, [index]: { ...prev[index], n: e.target.value }}))}
                                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:border-indigo-400"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 w-full sm:w-28 flex-shrink-0">
                                    <label className="block text-[10px] sm:text-xs font-bold text-indigo-500 mb-1 uppercase text-center focus-within:text-indigo-700">Edad (x)</label>
                                    <input 
                                        type="number" value={ejX} onChange={handleNumberChange(setEjX)}
                                        className="w-full px-2 sm:px-4 py-2 sm:py-3 border-2 border-indigo-100 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-center text-lg sm:text-xl font-bold text-indigo-900 shadow-sm transition-all"
                                    />
                                </div>
                                <div className="text-indigo-200 text-xl font-light hidden sm:block">|</div>
                                <div className="flex-1 w-full sm:w-28 flex-shrink-0">
                                    <label className="block text-[10px] sm:text-xs font-bold text-indigo-500 mb-1 uppercase text-center focus-within:text-indigo-700">Difer. (m)</label>
                                    <input 
                                        type="number" value={ejM} onChange={handleNumberChange(setEjM)}
                                        className="w-full px-2 sm:px-4 py-2 sm:py-3 border-2 border-indigo-100 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-center text-lg sm:text-xl font-bold text-indigo-900 shadow-sm transition-all"
                                    />
                                </div>
                                <div className="text-indigo-200 text-xl font-light hidden sm:block">|</div>
                                <div className="flex-1 w-full sm:w-28 flex-shrink-0">
                                    <label className="block text-[10px] sm:text-xs font-bold text-indigo-500 mb-1 uppercase text-center focus-within:text-indigo-700">Plazo (n)</label>
                                    <input 
                                        type="number" value={ejN} onChange={handleNumberChange(setEjN)}
                                        className="w-full px-2 sm:px-4 py-2 sm:py-3 border-2 border-indigo-100 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-center text-lg sm:text-xl font-bold text-indigo-900 shadow-sm transition-all"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Visualización del cálculo */}
                {resultadoEjercicio && !resultadoEjercicio.error ? (
                    <div className="bg-white p-6 rounded-lg border border-indigo-100 font-sans text-lg text-gray-800 shadow-inner">
                        <div className="text-sm font-bold text-indigo-500 mb-6 uppercase tracking-wide border-b pb-2">{resultadoEjercicio.titulo}</div>
                        
                        <div className="flex flex-col gap-6 items-start w-full overflow-hidden pb-4">
                            {/* Linea 1: Fórmula teórica */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 w-full">
                                <strong className="text-indigo-900/60 text-xs sm:text-sm uppercase sm:w-28 shrink-0">Fórmula:</strong>
                                <div className="text-lg sm:text-xl overflow-x-auto w-full pb-2">
                                    <BlockMath math={`${resultadoEjercicio.simboloPrin} = ${resultadoEjercicio.formDen === null ? resultadoEjercicio.formNum : `\\frac{${resultadoEjercicio.formNum}}{${resultadoEjercicio.formDen}}`}`} />
                                </div>
                            </div>
                            
                            {/* Linea 2: Sustitución numérica */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 w-full text-blue-800">
                                <strong className="text-indigo-900/60 text-xs sm:text-sm uppercase sm:w-28 shrink-0">Sustitución:</strong>
                                <div className="text-lg sm:text-xl text-blue-800 overflow-x-auto w-full pb-2">
                                    <BlockMath math={`${resultadoEjercicio.simboloPrin} = ${resultadoEjercicio.sustDen === null ? resultadoEjercicio.sustNum : `\\frac{${resultadoEjercicio.sustNum}}{${resultadoEjercicio.sustDen}}`}`} />
                                </div>
                            </div>
                            
                            {/* Linea 3: Resultado Final */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 w-full">
                                <strong className="text-indigo-900/60 text-xs sm:text-sm uppercase sm:w-28 shrink-0">Resultado:</strong>
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-sm font-bold text-xl sm:text-2xl overflow-x-auto max-w-full text-center sm:text-left">
                                    <InlineMath math={`${resultadoEjercicio.simboloPrin} = ${resultadoEjercicio.resultado}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : resultadoEjercicio?.error ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {resultadoEjercicio.error}
                    </div>
                ) : null}

            </div>
        </div>
    );
}
