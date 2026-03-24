// src/data/bonos.js

export const BONOS_DATA = [
  {
    id: 1,
    nombre: 'Precio de adquisición',
    descripcion: 'Calcula el valor presente de un bono con cupones anuales a una tasa de descuento dada.',
    imagen: 'Bonos_2023_Página_01.jpg',
    tipoCalculo: 'precio_adquisicion',
    parametros: {
      cuponPorcentaje: 5,
      cuponTipo: 'anual',
      nominal: 100,
      años: 3,
      tir: 3
    },
    formula: 'P = Σ(C / (1 + TIR)^t) + N / (1 + TIR)^n'
  },
  {
    id: 2,
    nombre: 'Rentabilidad de un Bono',
    descripcion: 'Calcula la tasa interna de retorno (TIR) de un bono con cupones anuales.',
    imagen: 'Bonos_2023_Página_02.jpg',
    tipoCalculo: 'rentabilidad',
    parametros: {
      cuponPorcentaje: 10,
      cuponTipo: 'anual',
      nominal: 100,
      años: 5,
      precioAdquisicion: 100
    },
    formula: 'TIR = tasa de descuento que iguala flujos de caja'
  },
  {
    id: 3,
    nombre: 'Rentabilidad de Bono de cupón semestral',
    descripcion: 'Calcula la TIR de un bono con cupones semestrales y la convierte a tasa anual.',
    imagen: 'Bonos_2023_Página_03.jpg',
    tipoCalculo: 'rentabilidad_semestral',
    parametros: {
      cuponPorcentaje: 5,
      cuponTipo: 'semestral',
      nominal: 100,
      años: 5,
      precioAdquisicion: 100
    },
    formula: 'TIR semestral se anualiza: TIR anual = (1 + TIR semestral)^2 - 1'
  },
  {
    id: 4,
    nombre: 'TIR de un Bono',
    descripcion: 'Calcula la TIR considerando una prima de amortización en el flujo final.',
    imagen: 'Bonos_2023_Página_04.jpg',
    tipoCalculo: 'tir',
    parametros: {
      nominal: 1000,
      cotizacion: 102,
      cuponPorcentaje: 6,
      cuponTipo: 'anual',
      años: 4,
      prima: 20
    },
    formula: 'TIR es la tasa que hace VAN = 0'
  },
  {
    id: 5,
    nombre: 'Precio en mercado secundario',
    descripcion: 'Calcula el precio de un bono en el mercado secundario con cupones semestrales y períodos fraccionarios.',
    imagen: 'Bonos_2023_Página_05.jpg',
    tipoCalculo: 'precio_secundario',
    parametros: {
      cuponPorcentaje: 1.5,
      cuponTipo: 'semestral',
      nominal: 100,
      tir: 3.4,
      años: 3,
      meses: 9
    },
    formula: 'P = Σ(C / (1 + TIR)^t) + N / (1 + TIR)^n'
  },
  {
    id: 6,
    nombre: 'Prima de amortización',
    descripcion: 'Calcula la rentabilidad de un bono cuando existe una prima de amortización.',
    imagen: 'Bonos_2023_Página_06.jpg',
    tipoCalculo: 'prima_amortizacion',
    parametros: {
      nominal: 1000,
      cuponPorcentaje: 6,
      cuponTipo: 'semestral',
      precioAdquisicion: 1000,
      prima: 10,
      meses: 18
    },
    formula: 'Rentabilidad incluye el efecto de la prima'
  },
  {
    id: 7,
    nombre: 'Nominal del bono',
    descripcion: 'Despeja el valor nominal de un bono conociendo el cupón y otros parámetros.',
    imagen: 'Bonos_2023_Página_07.jpg',
    tipoCalculo: 'nominal',
    parametros: {
      precio: 1250,
      cuponPorcentaje: 8,
      cuponTipo: 'semestral',
      años: 3,
      meses: 2,
      cuponImporte: 50
    },
    formula: 'N = (Cupón % nominal anual) / 2'
  },
  {
    id: 8,
    nombre: 'Deuda perpetúa',
    descripcion: 'Calcula el precio de un bono perpetuo con flujos infinitos de cupones.',
    imagen: 'Bonos_2023_Página_08.jpg',
    tipoCalculo: 'deuda_perpetua',
    parametros: {
      nominal: 1000,
      cuponPorcentaje: 3,
      cuponTipo: 'anual',
      tir: 10
    },
    formula: 'Precio = Cupón Anual / TIR = (Nominal × tasa cupón) / TIR'
  },
  {
    id: 9,
    nombre: 'Cupón que percibe el inversor',
    descripcion: 'Calcula el cupón desconocido considerando reinversión en una cuenta bancaria.',
    imagen: 'Bonos_2023_Página_09.jpg',
    tipoCalculo: 'cupon_inversor',
    parametros: {
      precio: 970,
      nominal: 1000,
      años: 4,
      rentabilidadInversor: 4,
      tasaBancaria: 2
    },
    formula: 'Requiere despejar C de la ecuación de rentabilidad'
  },
  {
    id: 10,
    nombre: 'Meses transcurridos',
    descripcion: 'Calcula el tiempo transcurrido desde la adquisición hasta el próximo cupón en un bono perpetuo.',
    imagen: 'Bonos_2023_Página_10.jpg',
    tipoCalculo: 'meses_transcurridos',
    parametros: {
      precio: 1349.89,
      cuponSemestral: 20,
      tir: 3
    },
    formula: 'Se calcula usando el valor actual de la renta perpetúa'
  },
  {
    id: 11,
    nombre: 'Precio de venta',
    descripcion: 'Calcula el precio de venta de un bono para lograr una rentabilidad objetivo.',
    imagen: 'Bonos_2023_Página_11.jpg',
    tipoCalculo: 'precio_venta',
    parametros: {
      nominal: 1000,
      precioCompra: 922,
      fechaCompra: '2004-07-01',
      cuponPorcentaje: 5,
      cuponTipo: 'semestral',
      fechaVenta: '2005-05-01',
      rentabilidad: 5
    },
    formula: 'Precio venta se calcula a partir de la rentabilidad deseada'
  },
  {
    id: 12,
    nombre: 'Cupón Corrido',
    descripcion: 'Calcula la porción acumulada del cupón desde la última fecha de pago hasta la adquisición.',
    imagen: 'Bonos_2023_Página_12.jpg',
    tipoCalculo: 'cupon_corrido',
    parametros: {
      fechaAdquisicion: '2004-10-17',
      precioExCupon: 105.874,
      cuponPorcentaje: 4.3,
      fechaPagoCupon: '06-15',
      fechaVencimiento: '2007-06-15'
    },
    formula: 'Cupón corrido = (Cupón anual × días transcurridos) / 360'
  },
  {
    id: 13,
    nombre: 'Bono perpetúo',
    descripcion: 'Calcula la TIR simple de un bono perpetuo (cupón / precio).',
    imagen: 'Bonos_2023_Página_13.jpg',
    tipoCalculo: 'bono_perpetuo',
    parametros: {
      cuponAnual: 52,
      precio: 1000,
      periodicidadCupon: 'anual'
    },
    formula: 'TIR = Cupón anual / Precio del bono'
  },
  {
    id: 14,
    nombre: 'Bono perpetúo con cobro a distinta frecuencia',
    descripcion: 'Calcula la TIR de un bono perpetuo ajustando por la frecuencia de pago de cupones.',
    imagen: 'Bonos_2023_Página_14.jpg',
    tipoCalculo: 'bono_perpetuo_frecuencia',
    parametros: {
      cuponAnual: 52,
      precio: 1026,
      proximoCupon: '6 meses'
    },
    formula: 'Se anualiza la TIR considerando el tiempo hasta el próximo cupón'
  },
  {
    id: 15,
    nombre: 'Dos inversiones',
    descripcion: 'Compara la rentabilidad de dos opciones de inversión con diferentes características.',
    imagen: 'Bonos_2023_Página_15.jpg',
    tipoCalculo: 'dos_inversiones',
    parametros: {
      capitalInicial: 100,
      periodo: 3,
      porcentajeA: 30
    },
    formula: 'Comparación de rentabilidades de dos inversiones'
  }
];

export const BONOS_TIPOS = {
  precio_adquisicion: {
    nombre: 'Precio de Adquisición',
    descriptor: 'Calcula el precio al que deberías comprar un bono'
  },
  rentabilidad: {
    nombre: 'Rentabilidad',
    descriptor: 'Calcula la TIR de un bono'
  },
  rentabilidad_semestral: {
    nombre: 'Rentabilidad Semestral',
    descriptor: 'Calcula la rentabilidad de bonos con cupones semestrales'
  },
  tir: {
    nombre: 'TIR',
    descriptor: 'Calcula la Tasa Interna de Retorno'
  },
  precio_secundario: {
    nombre: 'Precio en Mercado Secundario',
    descriptor: 'Calcula el precio en el mercado secundario'
  },
  prima_amortizacion: {
    nombre: 'Prima de Amortización',
    descriptor: 'Considera la prima en el cálculo'
  },
  nominal: {
    nombre: 'Nominal del Bono',
    descriptor: 'Calcula el nominal a partir de otros datos'
  },
  deuda_perpetua: {
    nombre: 'Deuda Perpetúa',
    descriptor: 'Calcula el valor de bonos perpetúos'
  },
  cupon_inversor: {
    nombre: 'Cupón del Inversor',
    descriptor: 'Calcula el cupón considerando reinversión'
  },
  meses_transcurridos: {
    nombre: 'Meses Transcurridos',
    descriptor: 'Calcula el tiempo entre fechas'
  },
  precio_venta: {
    nombre: 'Precio de Venta',
    descriptor: 'Calcula el precio de venta con rentabilidad objetivo'
  },
  cupon_corrido: {
    nombre: 'Cupón Corrido',
    descriptor: 'Calcula el cupón corrido en facturas'
  },
  bono_perpetuo: {
    nombre: 'Bono Perpetúo',
    descriptor: 'Calcula la TIR de un bono perpetúo'
  },
  bono_perpetuo_frecuencia: {
    nombre: 'Bono Perpetúo (Frecuencia)',
    descriptor: 'Calcula con distinta frecuencia de cobro'
  },
  dos_inversiones: {
    nombre: 'Dos Inversiones',
    descriptor: 'Compara dos opciones de inversión'
  }
};
