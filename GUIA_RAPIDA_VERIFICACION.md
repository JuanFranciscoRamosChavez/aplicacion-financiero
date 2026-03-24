# 🔍 Guía Rápida: Cómo Verificar el CPP de Enero 2019

## ⚡ Uso Inmediato

### Paso 1: Iniciar la Aplicación
```powershell
npm run dev
```

### Paso 2: Abrir la Calculadora
- Navegar a `http://localhost:5173` (o tu puerto configurado)
- Ir a la sección de Calculadora de Intereses

### Paso 3: Usar la Herramienta de Verificación
1. Desplázate hasta la sección **"Verificación de CCP con Trazabilidad"** (color naranja/ámbar)
2. Asegúrate de que esté seleccionado **"Fecha Específica"**
3. Ingresa la fecha: **`2019-01-07`**
4. Haz clic en **"Verificar CCP"**

### Paso 4: Interpretar Resultados

#### ✅ Si ves esto:
```
Valor Seleccionado por el Algoritmo
Valor (2 decimales): 4.42%
```
**Significa**: Banxico reporta 4.42% para enero 2019. El sistema está correcto.

#### ⚠️ Si ves múltiples valores:
```
Valores Encontrados en el Mes (2)
- 01 Ene 2019: 4.42%
- 05 Ene 2019: 4.41%
```
**Significa**: Hay dos valores diferentes publicados. El algoritmo toma el primero (4.42%).

---

## 🎯 Verificar Todo el Año 2019

Si quieres ver todos los meses de 2019:

1. Selecciona **"Rango de Fechas"**
2. Fecha Inicial: **`2019-01-01`**
3. Fecha Final: **`2019-12-31`**
4. Clic en **"Verificar CCP"**

Verás una tabla con todos los CPP de cada mes y advertencias si hay discrepancias.

---

## 🔍 Comparar con Tu Fuente

Después de obtener el resultado:

1. **Anota el valor mostrado por la herramienta**
2. **Compara con tu fuente de referencia** (donde obtuviste 4.41%)
3. **Si difieren**:
   - Verifica la fecha exacta de tu fuente
   - Revisa si hay múltiples publicaciones de Banxico
   - Considera que el valor original puede tener más decimales

---

## 💡 Solución Rápida si Necesitas 4.41%

### Opción A: Verificar que sea el valor correcto
Usa la herramienta para confirmar qué dice Banxico oficialmente.

### Opción B: Ajustar el algoritmo
Si confirmas que debería ser 4.41%, edita:

**Archivo**: [`api/calcular-intereses.js`](api/calcular-intereses.js)
**Línea**: ~205

```javascript
if (ccpDelMes.length > 0) {
  // Cambiar de:
  ccpMes = ccpDelMes[0].valor;
  
  // A (usar último valor):
  ccpMes = ccpDelMes[ccpDelMes.length - 1].valor;
}
```

### Opción C: Tabla de Correcciones
Crear excepciones para casos específicos:

```javascript
// Tabla de correcciones manuales
const correccionesCCP = {
  '2019-01': 4.41,  // Enero 2019: usar 4.41 en lugar de 4.42
};

const claveMes = `${año}-${String(mes).padStart(2, '0')}`;
ccpMes = correccionesCCP[claveMes] || ccpDelMes[0].valor;
```

---

## 📋 Checklist de 2 Minutos

- [ ] Abrir aplicación
- [ ] Ir a "Verificación de CCP"
- [ ] Ingresar fecha: 2019-01-07
- [ ] Ver resultado
- [ ] Comparar con tu fuente
- [ ] Decidir si necesitas ajustar

---

## 🆘 Solución de Problemas

### Error: "Token de Banxico no configurado"
**Solución**: Agregar en `.env`:
```
VITE_BANXICO_TOKEN=tu_token_aqui
BANXICO_TOKEN=tu_token_aqui
```

### No muestra resultados
**Solución**: 
1. Revisar consola del navegador (F12)
2. Ver si hay errores de red
3. Verificar que la API de Banxico esté disponible

### Diferencia persiste
**Solución**:
1. Usar modo "Rango de Fechas" para ver contexto
2. Verificar si hay múltiples valores en el mes
3. Consultar documentación oficial de Banxico

---

## 📞 Siguiente Paso

Después de ejecutar la verificación, **comparte los resultados** para decidir juntos si:
- El sistema está correcto (4.42% es el valor oficial)
- Necesitas ajustar el algoritmo (para usar 4.41%)
- Hay un caso especial que requiere manejo manual

La herramienta te dará **todos los datos necesarios** para tomar una decisión informada. ✅
