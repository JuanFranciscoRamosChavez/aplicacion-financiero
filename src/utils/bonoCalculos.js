// src/utils/bonoCalculos.js

/**
 * Cálculos matemáticos para bonos
 * Implementa las fórmulas de valoración de bonos
 */

// Bono 1: Precio de adquisición
export const calcularPrecioAdquisicion = (params) => {
  const { cuponPorcentaje, nominal, años, tir } = params;
  const cupon = (cuponPorcentaje / 100) * nominal;
  const tirDecimal = tir / 100;
  
  let precioPresente = 0;
  for (let t = 1; t <= años; t++) {
    precioPresente += cupon / Math.pow(1 + tirDecimal, t);
  }
  precioPresente += nominal / Math.pow(1 + tirDecimal, años);
  
  return {
    precio: precioPresente.toFixed(2),
    cuponAnual: cupon.toFixed(2),
    descripcion: `Precio: €${precioPresente.toFixed(2)}`
  };
};

// Bono 5: Precio en mercado secundario (con meses)
export const calcularPrecioSecundario = (params) => {
  const { cuponPorcentaje, nominal, tir, años, meses } = params;
  const cuponSemestral = (cuponPorcentaje / 100) * nominal;
  const tirDecimal = tir / 100;
  
  // Convertir años + meses a períodos semestrales
  const totalMeses = años * 12 + meses;
  const periodos = Math.ceil(totalMeses / 6);
  
  let precioPresente = 0;
  for (let t = 1; t <= periodos; t++) {
    const flujo = cuponSemestral;
    precioPresente += flujo / Math.pow(1 + tirDecimal / 2, t);
  }
  precioPresente += nominal / Math.pow(1 + tirDecimal / 2, periodos);
  
  return {
    precio: precioPresente.toFixed(2),
    cuponSemestral: cuponSemestral.toFixed(2),
    periodos: periodos,
    descripcion: `Precio: €${precioPresente.toFixed(2)}`
  };
};

// Bono 6: Prima de amortización
export const calcularPrimaAmortizacion = (params) => {
  const { nominal, cuponPorcentaje, precioAdquisicion, prima, meses } = params;
  const cuponSemestral = (cuponPorcentaje / 100 / 2) * nominal;
  const periodos = Math.ceil(meses / 6);
  
  let tir = 0.05;
  for (let i = 0; i < 100; i++) {
    let valor = -precioAdquisicion;
    let derivada = 0;
    
    for (let t = 1; t <= periodos; t++) {
      valor += cuponSemestral / Math.pow(1 + tir, t);
      derivada -= t * cuponSemestral / Math.pow(1 + tir, t + 1);
    }
    
    const valorFinal = nominal + prima;
    valor += valorFinal / Math.pow(1 + tir, periodos);
    derivada -= periodos * valorFinal / Math.pow(1 + tir, periodos + 1);
    
    const anterior = tir;
    tir = tir - valor / derivada;
    
    if (Math.abs(tir - anterior) < 0.000001) break;
  }
  
  const tirAnual = (Math.pow(1 + tir, 2) - 1);
  
  return {
    tirSemestral: (tir * 100).toFixed(4),
    tirAnual: (tirAnual * 100).toFixed(4),
    cuponSemestral: cuponSemestral.toFixed(2),
    prima: prima.toFixed(2),
    descripcion: `TIR Anual: ${(tirAnual * 100).toFixed(2)}%`
  };
};

// Bono 7: Nominal del bono (despejar N)
export const calcularNominal = (params) => {
  const { precio, cuponPorcentaje, cuponImporte } = params;
  
  // Cupón = (Porcentaje nominal / 2) × N
  // Por tanto: N = (2 × Cupón) / Porcentaje nominal
  const porcentajeSemestral = cuponPorcentaje / 100;
  const nominal = (2 * cuponImporte) / porcentajeSemestral;
  
  return {
    nominal: nominal.toFixed(2),
    cuponSemestral: cuponImporte.toFixed(2),
    descripcion: `Nominal: €${nominal.toFixed(2)}`
  };
};

// Bono 9: Cupón que percibe el inversor (con reinversión)
export const calcularCuponInversor = (params) => {
  const { precio, nominal, años, rentabilidadInversor, tasaBancaria } = params;
  const rentabilidadDecimal = rentabilidadInversor / 100;
  const tasaBancariaDecimal = tasaBancaria / 100;
  
  // Objetivo: VF = precio × (1 + rentabilidad)^años
  const valorFinalObjetivo = precio * Math.pow(1 + rentabilidadDecimal, años);
  
  // VF = nominal + Σ(cupón × (1 + tasaBancaria)^(años-t)), t=1..años
  // Usar Newton-Raphson para encontrar cupón que satisface la ecuación
  let cupon = (valorFinalObjetivo - nominal) / años; // estimación inicial
  
  for (let i = 0; i < 100; i++) {
    // Calcular valor actual con cupón actual
    let sumatoria = nominal;
    let derivada = 0; // derivada respecto a cupón
    
    for (let t = 1; t <= años; t++) {
      const factor = Math.pow(1 + tasaBancariaDecimal, años - t);
      sumatoria += cupon * factor;
      derivada += factor; // d(sumatoria)/d(cupon) = suma de factores
    }
    
    // Función: f(C) = sumatoria - valorFinalObjetivo
    const f = sumatoria - valorFinalObjetivo;
    
    if (Math.abs(f) < 0.001) break;
    
    // Newton-Raphson: C_nuevo = C - f / f'
    cupon = cupon - f / derivada;
    
    // Validar que no sea negativo
    if (cupon < 0) cupon = 0.01;
  }
  
  // Calcular valor futuro del cupón con reinversión
  let vfCupones = 0;
  for (let t = 1; t <= años; t++) {
    vfCupones += cupon * Math.pow(1 + tasaBancariaDecimal, años - t);
  }
  const vfTotal = nominal + vfCupones;
  
  return {
    cupon: cupon.toFixed(2),
    valorFuturoCupones: vfCupones.toFixed(2),
    valorFinalTotal: vfTotal.toFixed(2),
    rentabilidadObjetivo: rentabilidadInversor.toFixed(2),
    descripcion: `Cupón anual: €${cupon.toFixed(2)}`
  };
};

// Bono 10: Meses transcurridos (deuda perpetúa)
export const calcularMesesTranscurridos = (params) => {
  const { precio, cuponSemestral, tir } = params;
  const tirSemestralDecimal = tir / 200; // TIR anual ÷ 2 para semestral
  
  // Precio de perpetúa semestral = Cupón Semestral / (TIR semestral)
  const precioTeórico = cuponSemestral / tirSemestralDecimal;
  
  // Diferencia de precio indica días acumulados del cupón
  // Si precio < teórico: falta cupón, está entre pagos
  // Cupón corrido = diferencia de precio
  const cuponCorrido = precioTeórico - precio;
  
  // Días transcurridos desde último pago = (cupón corrido / cupón semestral) × 180 días
  const diasTranscurridos = (cuponCorrido / cuponSemestral) * 180;
  const mesesTranscurridos = (diasTranscurridos / 30).toFixed(2);
  
  return {
    mesesTranscurridos: mesesTranscurridos,
    diasTranscurridos: diasTranscurridos.toFixed(0),
    precioTeórico: precioTeórico.toFixed(2),
    cuponCorrido: cuponCorrido.toFixed(2),
    descripcion: `Meses transcurridos: ${mesesTranscurridos} (${diasTranscurridos.toFixed(0)} días)`
  };
};

// Bono 11: Precio de venta
export const calcularPrecioVenta = (params) => {
  const { nominal, precioCompra, cuponPorcentaje, fechaVenta, rentabilidad } = params;
  
  // El cupón es semestral
  const cupon = (cuponPorcentaje / 100 / 2) * nominal;
  const rentabilidadDecimal = rentabilidad / 100;
  
  // Calcular períodos semestrales hasta vencimiento
  // Por defecto usar 6 períodos (3 años) si no se pueden calcular de las fechas
  let periodos = 6;
  
  try {
    // Intentar extraer año de vencimiento de fechaVenta o usar un estándar
    // Si fechaVenta está disponible, calcular desde ahí hasta vencimiento
    // Por ahora usar la fecha implícita: bono vence 3 años después del típico inicio
    // Calcular días desde venta hasta vencimiento aproximado
    const fechaV = new Date(fechaVenta);
    const añoVencimiento = fechaV.getFullYear() + 3; // asume vencimiento 3 años adelante
    const fechaVencimientoDate = new Date(fechaV.getFullYear() + 3, fechaV.getMonth(), fechaV.getDate());
    const diasHastaVencimiento = Math.floor((fechaVencimientoDate - fechaV) / (1000 * 60 * 60 * 24));
    periodos = Math.ceil(diasHastaVencimiento / 180); // 180 días por semestre
  } catch (e) {
    // Si hay error, usar 6 períodos (estándar 3 años)
    periodos = 6;
  }
  
  // Valorar el bono con los períodos calculados
  let precioVenta = 0;
  for (let t = 1; t <= periodos; t++) {
    precioVenta += cupon / Math.pow(1 + rentabilidadDecimal / 2, t);
  }
  precioVenta += nominal / Math.pow(1 + rentabilidadDecimal / 2, periodos);
  
  // Calcular ganancia/pérdida
  const gananciaOPerdida = precioVenta - precioCompra;
  const rentabilidadNeta = gananciaOPerdida / precioCompra * 100;
  
  return {
    precioVenta: precioVenta.toFixed(2),
    precioCompra: precioCompra.toFixed(2),
    gananciaOPerdida: gananciaOPerdida.toFixed(2),
    rentabilidadNeta: rentabilidadNeta.toFixed(2),
    cuponSemestral: cupon.toFixed(2),
    periodos: periodos,
    rentabilidad: rentabilidad.toFixed(2),
    descripcion: `Precio de Venta: €${precioVenta.toFixed(2)}`
  };
};

// Bono 12: Cupón corrido
export const calcularCuponCorrido = (params) => {
  const { fechaAdquisicion, precioExCupon, cuponPorcentaje, fechaPagoCupon, fechaVencimiento } = params;
  
  // Validar formato de fecha (YYYY-MM-DD o DD-MM-YYYY o MM-DD)
  let diasTranscurridos = 0;
  
  try {
    // Intenta parsear fechaAdquisicion en formato ISO o DD-MM-YYYY
    let fechaAdq = new Date(fechaAdquisicion);
    
    // Si no es válida, intenta formato YYYY-MM-DD
    if (isNaN(fechaAdq.getTime())) {
      // Intenta cambiar formato
      const partes = fechaAdquisicion.split('-');
      if (partes.length === 3) {
        if (partes[0].length === 4) {
          // Formato YYYY-MM-DD (ya está bien)
          fechaAdq = new Date(fechaAdquisicion);
        } else if (partes[2].length === 4) {
          // Formato MM-DD-YYYY
          fechaAdq = new Date(`${partes[2]}-${partes[0]}-${partes[1]}`);
        } else {
          // Formato DD-MM-YYYY
          fechaAdq = new Date(`20${partes[2]}-${partes[1]}-${partes[0]}`);
        }
      }
    }
    
    // Última fecha de pago: tomar mes y día de fechaPagoCupon
    // Asumir que fue en el mismo año o año anterior
    let ultimaPago;
    const partes = fechaPagoCupon.split('-');
    
    if (partes.length === 2) {
      const mes = parseInt(partes[0]);
      const dia = parseInt(partes[1]);
      const año = fechaAdq.getFullYear();
      
      // Si el mes de pago es después del mes actual, fue el año pasado
      if (mes > fechaAdq.getMonth() + 1) {
        ultimaPago = new Date(año - 1, mes - 1, dia);
      } else {
        ultimaPago = new Date(año, mes - 1, dia);
      }
    } else {
      // Si no se puede parsear, usar 125 días como estimación estándar
      diasTranscurridos = 125;
      ultimaPago = null;
    }
    
    // Calcular días entre última pago y adquisición
    if (ultimaPago && !isNaN(ultimaPago.getTime())) {
      diasTranscurridos = Math.floor((fechaAdq - ultimaPago) / (1000 * 60 * 60 * 24));
      // Asegurar que sea positivo
      if (diasTranscurridos < 0) diasTranscurridos += 365;
    }
  } catch (e) {
    // Si hay error en parsing, usar estimación estándar
    diasTranscurridos = 125;
  }
  
  // Cálculo del cupón corrido
  const cuponAnual = (cuponPorcentaje / 100) * 1000;
  const cuponCorrido = (cuponAnual * diasTranscurridos) / 360;
  const precio = (precioExCupon / 100) * 1000;
  const precioTotal = precio + cuponCorrido;
  
  return {
    cuponAnual: cuponAnual.toFixed(2),
    diasTranscurridos: diasTranscurridos,
    cuponCorrido: cuponCorrido.toFixed(2),
    precioExCupon: precio.toFixed(2),
    precioAdquisicion: precioTotal.toFixed(2),
    descripcion: `Cupón Corrido: €${cuponCorrido.toFixed(2)}`
  };
};

// Bono 14: Bono perpetúo con frecuencia de cobro
export const calcularBonoPerpetuoFrecuencia = (params) => {
  const { cuponAnual, precio, proximoCupon } = params;
  
  // TIR = Cupón / Precio, ajustada por frecuencia de pago
  const tirSimple = (cuponAnual / precio) * 100;
  let tirAjustado = tirSimple; // Por defecto, anual
  let frecuenciaTexto = 'anual';
  
  // Ajustar según frecuencia de cobro
  if (proximoCupon.toLowerCase().includes('6') || proximoCupon.toLowerCase().includes('semestral')) {
    // Cupón semestral: TIR_semestral = TIR_anual / 2
    // Después anualizar: TIR_anual_efectiva = (1 + TIR_semestral)^2 - 1
    const cuponSemestral = cuponAnual / 2;
    const precioSemestral = precio; // El precio es del bono completo
    const tirSemestral = (cuponSemestral / precioSemestral) * 100;
    tirAjustado = (Math.pow(1 + tirSemestral / 100, 2) - 1) * 100; // Anualizar
    frecuenciaTexto = 'semestral (anualizado)';
  } else if (proximoCupon.toLowerCase().includes('3') || proximoCupon.toLowerCase().includes('trimestral')) {
    // Cupón trimestral: TIR_trimestral = TIR_anual / 4
    const cuponTrimestral = cuponAnual / 4;
    const tirTrimestral = (cuponTrimestral / precio) * 100;
    tirAjustado = (Math.pow(1 + tirTrimestral / 100, 4) - 1) * 100; // Anualizar
    frecuenciaTexto = 'trimestral (anualizado)';
  } else if (proximoCupon.toLowerCase().includes('mes')) {
    // Cupón mensual: TIR_mensual = TIR_anual / 12
    const cuponMensual = cuponAnual / 12;
    const tirMensual = (cuponMensual / precio) * 100;
    tirAjustado = (Math.pow(1 + tirMensual / 100, 12) - 1) * 100; // Anualizar
    frecuenciaTexto = 'mensual (anualizado)';
  }
  
  return {
    tirSimple: tirSimple.toFixed(4),
    tirAjustada: tirAjustado.toFixed(4),
    proximoCupon: proximoCupon,
    frecuencia: frecuenciaTexto,
    descripcion: `TIR ${frecuenciaTexto}: ${tirAjustado.toFixed(2)}%`
  };
};

// Bono 15: Comparación de dos inversiones
export const calcularDosInversiones = (params) => {
  const { capitalInicial, periodo, porcentajeA } = params;
  
  // Rentabilidades estimadas típicas para A y B
  const porcentajeB = 100 - porcentajeA;
  const capitalA = (porcentajeA / 100) * capitalInicial;
  const capitalB = (porcentajeB / 100) * capitalInicial;
  
  // Rentabilidades típicas
  const rentabilidadA = 5; // 5% anual para inversión A
  const rentabilidadB = 3; // 3% anual para inversión B
  
  const vfA = capitalA * Math.pow(1 + rentabilidadA / 100, periodo);
  const vfB = capitalB * Math.pow(1 + rentabilidadB / 100, periodo);
  const vfTotal = vfA + vfB;
  
  const rentabilidadTotal = ((vfTotal - capitalInicial) / capitalInicial) * 100;
  const rentabilidadAnualEquivalente = (Math.pow(vfTotal / capitalInicial, 1 / periodo) - 1) * 100;
  
  return {
    capitalA: capitalA.toFixed(2),
    capitalB: capitalB.toFixed(2),
    valorFinalA: vfA.toFixed(2),
    valorFinalB: vfB.toFixed(2),
    valorFinalTotal: vfTotal.toFixed(2),
    rentabilidadTotal: rentabilidadTotal.toFixed(2),
    rentabilidadAnualEquivalente: rentabilidadAnualEquivalente.toFixed(4),
    descripcion: `Valor Final Total: €${vfTotal.toFixed(2)}`
  };
};

// Bono 2: Rentabilidad (TIR)
export const calcularRentabilidad = (params) => {
  const { cuponPorcentaje, nominal, años, precioAdquisicion } = params;
  const cupon = (cuponPorcentaje / 100) * nominal;
  
  // Usar método Newton-Raphson para encontrar TIR
  let tir = 0.1; // Estimación inicial
  for (let i = 0; i < 100; i++) {
    let valor = -precioAdquisicion;
    let derivada = 0;
    
    for (let t = 1; t <= años; t++) {
      valor += cupon / Math.pow(1 + tir, t);
      derivada -= t * cupon / Math.pow(1 + tir, t + 1);
    }
    
    valor += nominal / Math.pow(1 + tir, años);
    derivada -= años * nominal / Math.pow(1 + tir, años + 1);
    
    const tirAnterior = tir;
    tir = tir - valor / derivada;
    
    if (Math.abs(tir - tirAnterior) < 0.000001) break;
  }
  
  return {
    tir: (tir * 100).toFixed(4),
    cuponAnual: cupon.toFixed(2),
    precioAdquisicion: precioAdquisicion.toFixed(2),
    nominal: nominal.toFixed(2),
    años: años,
    descripcion: `TIR: ${(tir * 100).toFixed(2)}%`
  };
};

// Bono 3: Rentabilidad semestral (anualizada)
export const calcularRentabilidadSemestral = (params) => {
  const { cuponPorcentaje, nominal, años, precioAdquisicion } = params;
  const cuponSemestral = (cuponPorcentaje / 100) * nominal;
  const periodos = años * 2;
  
  // Buscar TIR semestral
  let tirSemestral = 0.05;
  for (let i = 0; i < 100; i++) {
    let valor = -precioAdquisicion;
    let derivada = 0;
    
    for (let t = 1; t <= periodos; t++) {
      valor += cuponSemestral / Math.pow(1 + tirSemestral, t);
      derivada -= t * cuponSemestral / Math.pow(1 + tirSemestral, t + 1);
    }
    
    valor += nominal / Math.pow(1 + tirSemestral, periodos);
    derivada -= periodos * nominal / Math.pow(1 + tirSemestral, periodos + 1);
    
    const anterior = tirSemestral;
    tirSemestral = tirSemestral - valor / derivada;
    
    if (Math.abs(tirSemestral - anterior) < 0.000001) break;
  }
  
  // Anualizar
  const tirAnual = (Math.pow(1 + tirSemestral, 2) - 1);
  
  return {
    tirSemestral: (tirSemestral * 100).toFixed(4),
    tirAnual: (tirAnual * 100).toFixed(4),
    cuponSemestral: cuponSemestral.toFixed(2),
    descripcion: `TIR Anual: ${(tirAnual * 100).toFixed(2)}%`
  };
};

// Bono 4: TIR con prima de amortización
export const calcularTIRConPrima = (params) => {
  const { nominal, cotizacion, cuponPorcentaje, años, prima } = params;
  
  const precio = (cotizacion / 100) * nominal;
  const cupon = (cuponPorcentaje / 100) * nominal;
  const valorFinal = nominal + prima;
  
  let tir = 0.1;
  for (let i = 0; i < 100; i++) {
    let valor = -precio;
    let derivada = 0;
    
    for (let t = 1; t <= años; t++) {
      valor += cupon / Math.pow(1 + tir, t);
      derivada -= t * cupon / Math.pow(1 + tir, t + 1);
    }
    
    valor += valorFinal / Math.pow(1 + tir, años);
    derivada -= años * valorFinal / Math.pow(1 + tir, años + 1);
    
    const anterior = tir;
    tir = tir - valor / derivada;
    
    if (Math.abs(tir - anterior) < 0.000001) break;
  }
  
  return {
    tir: (tir * 100).toFixed(4),
    precioCompra: precio.toFixed(2),
    cuponAnual: cupon.toFixed(2),
    prima: prima.toFixed(2),
    descripcion: `TIR: ${(tir * 100).toFixed(2)}%`
  };
};

// Bono 8: Deuda perpetúa
export const calcularDeudaPerpetua = (params) => {
  const { nominal, cuponPorcentaje, tir } = params;
  
  const cupon = (cuponPorcentaje / 100) * nominal;
  const tirDecimal = tir / 100;
  const precio = cupon / tirDecimal;
  
  return {
    precio: precio.toFixed(2),
    cuponAnual: cupon.toFixed(2),
    tir: tir.toFixed(2),
    descripcion: `Precio: €${precio.toFixed(2)}`
  };
};

// Bono 13: Bono perpetúo simple
export const calcularBonoPerpetuoSimple = (params) => {
  const { cuponAnual, precio } = params;
  
  const tir = (cuponAnual / precio) * 100;
  
  return {
    tir: tir.toFixed(4),
    cuponAnual: parseFloat(cuponAnual).toFixed(2),
    precio: parseFloat(precio).toFixed(2),
    descripcion: `TIR: ${tir.toFixed(2)}%`
  };
};

// Bono 13 (Método 2): Bono perpetúo con capitalización
export const calcularBonoPerpetuoCapitalizacion = (params) => {
  const { cuponAnual, precio, frecuencia } = params;
  
  // frecuencia: "anual", "semestral", etc.
  const tirSimple = (cuponAnual / precio) * 100;
  
  // Ajustar por capitalización
  let tirEfectivo = tirSimple;
  if (frecuencia === 'semestral') {
    tirEfectivo = (Math.pow(1 + (tirSimple / 100) / 2, 2) - 1) * 100;
  }
  
  return {
    tirSimple: tirSimple.toFixed(4),
    tirEfectivo: tirEfectivo.toFixed(4),
    cuponAnual: parseFloat(cuponAnual).toFixed(2),
    precio: parseFloat(precio).toFixed(2),
    descripcion: `TIR Efectiva: ${tirEfectivo.toFixed(2)}%`
  };
};

// Bono general: Calcular duración de Macaulay
export const calcularDuracion = (params) => {
  const { cuponPorcentaje, nominal, años, tir } = params;
  const cupon = (cuponPorcentaje / 100) * nominal;
  const tirDecimal = tir / 100;
  
  let numerador = 0;
  let denominador = 0;
  
  for (let t = 1; t <= años; t++) {
    const flujo = cupon;
    const valorPresente = flujo / Math.pow(1 + tirDecimal, t);
    numerador += t * valorPresente;
    denominador += valorPresente;
  }
  
  const flujoFinal = nominal;
  const valorPresenteFinal = flujoFinal / Math.pow(1 + tirDecimal, años);
  numerador += años * valorPresenteFinal;
  denominador += valorPresenteFinal;
  
  const duracion = numerador / denominador;
  
  return {
    duracion: duracion.toFixed(4),
    descripcion: `Duración: ${duracion.toFixed(2)} años`
  };
};

// Bono: Calcular convexidad
export const calcularConvexidad = (params) => {
  const { cuponPorcentaje, nominal, años, tir } = params;
  const cupon = (cuponPorcentaje / 100) * nominal;
  const tirDecimal = tir / 100;
  
  let numerador = 0;
  let denominador = 0;
  
  for (let t = 1; t <= años; t++) {
    const flujo = cupon;
    const factor = t * (t + 1);
    const valorPresente = flujo / Math.pow(1 + tirDecimal, t);
    numerador += factor * valorPresente;
    denominador += valorPresente;
  }
  
  const flujoFinal = nominal;
  const factorFinal = años * (años + 1);
  const valorPresenteFinal = flujoFinal / Math.pow(1 + tirDecimal, años);
  numerador += factorFinal * valorPresenteFinal;
  denominador += valorPresenteFinal;
  
  const convexidad = numerador / (denominador * Math.pow(1 + tirDecimal, 2));
  
  return {
    convexidad: convexidad.toFixed(4),
    descripcion: `Convexidad: ${convexidad.toFixed(4)}`
  };
};

// Bono: Calcular valor actual
export const calcularValorActual = (params) => {
  const { flujos, tir } = params;
  const tirDecimal = tir / 100;
  
  let va = 0;
  flujos.forEach((flujo, index) => {
    va += flujo / Math.pow(1 + tirDecimal, index + 1);
  });
  
  return {
    valorActual: va.toFixed(2),
    descripcion: `Valor Actual: €${va.toFixed(2)}`
  };
};
