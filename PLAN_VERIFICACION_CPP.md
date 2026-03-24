# 🔍 Plan de Contingencia y Verificación de CPP

## Problema Identificado

Se detectó una discrepancia en el valor del CPP (Costo Porcentual Promedio) para enero de 2019:
- **Valor esperado**: 4.41%
- **Valor obtenido**: 4.42%
- **Diferencia**: 0.01%

Esta pequeña diferencia puede deberse a:
1. Redondeo de decimales
2. Múltiples valores publicados por Banxico en el mismo mes
3. Fecha específica de consulta dentro del mes
4. Formato de precisión en la API de Banxico

---

## 🛠️ Sistema de Verificación Implementado

### 1. API de Verificación (`/api/verificar-cpp`)

Se creó un endpoint especializado que proporciona **trazabilidad completa** de los valores de CPP:

#### Modo 1: Verificación de Fecha Específica
```
GET /api/verificar-cpp?fecha=2019-01-07
```

**Retorna:**
- Todos los valores de CPP encontrados en el mes
- Valores del mes anterior (si aplica)
- El valor que seleccionaría el algoritmo actual
- Criterio de selección utilizado
- Valores originales y redondeados

#### Modo 2: Verificación de Rango
```
GET /api/verificar-cpp?fechaInicio=2019-01-01&fechaFinal=2019-12-31
```

**Retorna:**
- CPP de todos los meses en el rango
- Advertencias sobre múltiples valores o discrepancias
- Primer y último valor de cada mes
- Detección de cambios por redondeo significativos

### 2. Componente UI de Verificación

En la calculadora de intereses, se agregó una sección completa de "Verificación de CCP con Trazabilidad" que permite:

✅ **Verificar fecha específica**: Ideal para casos como 7 de enero de 2019
✅ **Verificar rango de fechas**: Para análisis de múltiples meses
✅ **Visualización detallada**: Muestra todos los valores encontrados
✅ **Advertencias automáticas**: Detecta discrepancias y multiple valores
✅ **Trazabilidad completa**: Logs de cada paso del proceso

---

## 📋 Proceso de Verificación Paso a Paso

### Para verificar el caso del 7 de enero de 2019:

1. **Abrir la Calculadora de Intereses**
   - Navegar a la sección "Verificación de CCP con Trazabilidad"

2. **Seleccionar modo "Fecha Específica"**
   - Ingresar: `2019-01-07`

3. **Hacer clic en "Verificar CCP"**

4. **Analizar los resultados:**
   - Ver qué valor(es) encontró Banxico para enero 2019
   - Verificar el valor exacto (con todos los decimales)
   - Comparar el valor redondeado a 2 decimales
   - Revisar si hay múltiples valores en el mes
   - Identificar cuál valor selecciona el algoritmo

### Interpretación de Resultados:

#### Escenario A: Un solo valor en el mes
```
✅ Valor Seleccionado: 4.42%
   Fecha: 01 Ene 2019
   Valor Original: 4.4234567
   Criterio: Primer valor del mes actual
```
**Acción**: El valor es correcto. La diferencia con 4.41% puede ser del sistema de referencia.

#### Escenario B: Múltiples valores en el mes
```
⚠️ Enero 2019: Múltiples valores (2), diferencia: 0.01 puntos

Valores encontrados:
- 01 Ene 2019: 4.42% (original: 4.4156)
- 05 Ene 2019: 4.41% (original: 4.4089)

✅ Algoritmo usa: 4.42% (primer valor)
```
**Acción**: Si esperas 4.41%, necesitas usar el segundo valor o cambiar la lógica de selección.

#### Escenario C: Redondeo significativo
```
⚠️ El redondeo a 2 decimales cambia significativamente el valor
   (4.414999 → 4.41)
```
**Acción**: Considerar usar más decimales en los cálculos.

---

## 🔧 Soluciones Propuestas

### Solución 1: Ajustar Lógica de Selección de CCP

Si Banxico publica correcciones o múltiples valores en un mes, puedes cambiar el criterio:

**Actual**: Toma el primer valor del mes
**Alternativas**:
- Tomar el último valor del mes (más actualizado)
- Tomar el valor más cercano a la fecha de cálculo
- Promediar múltiples valores del mes

**Ubicación del código**: [api/calcular-intereses.js](api/calcular-intereses.js#L195-L215)

```javascript
// Buscar el CCP del mes actual
const ccpDelMes = fechasCCPOrdenadas.filter(item => {
  const fechaCCP = new Date(item.fecha);
  return fechaCCP.getFullYear() === año && fechaCCP.getMonth() === mes - 1;
});

if (ccpDelMes.length > 0) {
  // ACTUAL: Usar el primer valor
  ccpMes = ccpDelMes[0].valor;
  
  // ALTERNATIVA 1: Usar el último valor (más actualizado)
  // ccpMes = ccpDelMes[ccpDelMes.length - 1].valor;
  
  // ALTERNATIVA 2: Promediar todos los valores
  // ccpMes = ccpDelMes.reduce((sum, item) => sum + item.valor, 0) / ccpDelMes.length;
}
```

### Solución 2: Aumentar Precisión Decimal

Conservar más decimales en los cálculos intermedios:

**Ubicación**: [api/calcular-intereses.js](api/calcular-intereses.js#L228)

```javascript
// ACTUAL: Redondeo a 2 decimales
ccpPorcentaje: parseFloat(ccpMes.toFixed(2)),

// ALTERNATIVA: Mantener precisión completa
ccpPorcentaje: ccpMes, // Sin redondeo
```

### Solución 3: Validación Cruzada con Fuente Externa

Si tienes una fuente de referencia (Excel, documento oficial):

1. Usar la herramienta de verificación para obtener el valor de Banxico
2. Comparar con tu fuente de referencia
3. Si difieren, documentar la discrepancia
4. Opcionalmente, crear una tabla de correcciones manuales

### Solución 4: Logging Permanente

Para futuros casos, agregar logging detallado:

**Ubicación**: [api/calcular-intereses.js](api/calcular-intereses.js#L65-L70)

```javascript
// Ya implementado - solo descomentar en producción si es necesario
console.log(`[DEV] CCP obtenidos: ${numCCPs} valores`);
console.log(`[DEV] Primera fecha CCP: ${fechasCCP[0]} -> ${ccpMensual[fechasCCP[0]]}`);
```

---

## 📊 Checklist de Verificación

Usar esta lista cada vez que haya discrepancias:

- [ ] Verificar la fecha exacta en la herramienta de verificación
- [ ] Confirmar cuántos valores hay en ese mes
- [ ] Revisar el valor original (sin redondeo)
- [ ] Comparar con fuente de referencia externa
- [ ] Verificar el mes anterior y siguiente para patrones
- [ ] Documentar la discrepancia encontrada
- [ ] Decidir si es necesario ajustar el algoritmo

---

## 🎯 Caso Específico: Enero 2019

### Pasos para Resolver:

1. **Ejecutar Verificación**
   ```
   Fecha: 2019-01-07
   ```

2. **Capturar los valores mostrados**
   - Anotar todos los valores de enero 2019
   - Anotar valores de diciembre 2018 (por referencia)

3. **Comparar con tu fuente**
   - ¿De dónde obtuviste el 4.41%?
   - ¿Es un documento oficial de Banxico?
   - ¿Fecha exacta del documento?

4. **Decisión**
   - Si Banxico dice 4.42%: El sistema está correcto
   - Si tu fuente oficial dice 4.41%: Investigar discrepancia en Banxico
   - Si hay múltiples valores: Decidir criterio de selección

---

## 🔄 Proceso de Debugging en Producción

### Activar Logs Detallados

Los logs ya están implementados en el código. Para verlos:

1. **En desarrollo local**:
   - Abrir consola del navegador (F12)
   - Ver la pestaña "Console"
   - Buscar logs con prefijo `[DEV]` o `[BANXICO]`

2. **En Vercel (producción)**:
   - Ir a Vercel Dashboard
   - Seleccionar proyecto
   - Ver "Functions" → "Logs"
   - Filtrar por `/api/calcular-intereses` o `/api/verificar-cpp`

### Ejemplo de Logs Esperados

```
[BANXICO] Consultando: https://www.banxico.org.mx/.../SF3368/datos/2019-01-01/2019-01-31
[BANXICO] 01/01/2019 -> 4.42
[BANXICO] Total valores obtenidos: 1
[VERIFICACIÓN] Fecha específica: 2019-01-07
[VERIFICACIÓN] Consultando CPP del mes completo: 2019-01-01 a 2019-01-31
```

---

## 📝 Recomendaciones Finales

1. **No cambiar el algoritmo sin verificar primero**
   - Usar la herramienta de verificación
   - Confirmar que hay una discrepancia real
   - Entender la causa raíz

2. **Documentar todas las decisiones**
   - Si decides cambiar el criterio de selección, documentarlo
   - Mantener un historial de casos especiales

3. **Validación con múltiples fechas**
   - No solo verificar enero 2019
   - Probar con 5-10 fechas diferentes
   - Asegurar consistencia global

4. **Considerar tolerancia de error**
   - Una diferencia de 0.01% es muy pequeña
   - Evaluar el impacto real en el monto final
   - Decidir si vale la pena ajustar

---

## 🚀 Próximos Pasos

1. **Ejecutar la verificación** para el 7 de enero de 2019
2. **Analizar los resultados** obtenidos
3. **Compartir los hallazgos** (valores encontrados)
4. **Decidir el curso de acción** basado en los datos reales
5. Si es necesario, **ajustar el algoritmo** con una de las soluciones propuestas

---

## 📞 Contacto y Soporte

Si encuentras problemas al usar la herramienta de verificación:
- Revisar los logs en consola del navegador
- Verificar que la variable de entorno `BANXICO_TOKEN` esté configurada
- Confirmar que la API de Banxico esté funcionando

La herramienta de verificación está diseñada para ser **autónoma** y proporcionar toda la información necesaria para tomar decisiones informadas sobre los valores de CPP.
