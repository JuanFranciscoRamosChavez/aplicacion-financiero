# 💰 Sistema de Finanzas

Aplicación web que incluye:
- 📊 **Cuestionario de Perfil de Inversionista** 
- 💰 **Calculadora de Intereses Moratorios** (con UDIs y CCP de Banxico)

## 🏗️ Arquitectura

### Backend Serverless (Node.js)
Toda la lógica del código Python ha sido replicada en Node.js:
- **`/api/banxico.js`** - Consulta series de Banxico (UDI y CCP)
- **`/api/calcular-intereses.js`** - Cálculo completo de intereses moratorios

### Frontend (React + Vite)
- Interfaz moderna con Tailwind CSS
- Navegación entre cuestionario y calculadora
- Sin dependencia de servicios externos

## 🚀 Configuración Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_BANXICO_TOKEN=bfd303ff4407d875d8ec5ab8fa685d3d5be369d220d9db488c8d3edc246ef502
```

> **Nota:** Obtén tu token gratuito en: https://www.banxico.org.mx/SieAPIRest/service/v1/token

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en http://localhost:5173

**En desarrollo local:**
- El plugin de Vite intercepta las peticiones `/api/*`
- Hace las consultas a Banxico desde el servidor Node.js (sin CORS)
- Ejecuta toda la lógica de cálculo en el backend

## 📦 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a https://vercel.com
   - Click en "New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

3. **Configura las variables de entorno en Vercel:**
   - En el dashboard del proyecto → Settings → Environment Variables
   - Añade: 
     - **Name:** `BANXICO_TOKEN`
     - **Value:** `bfd303ff4407d875d8ec5ab8fa685d3d5be369d220d9db488c8d3edc246ef502`
     - **Environment:** Production, Preview, Development (selecciona todos)

4. **Deploy!**
   - Click en "Deploy"
   - Vercel construirá y desplegará automáticamente
   - Las funciones en `/api/` se desplegarán como serverless functions

## 🔧 Estructura del Proyecto

```
Finanzas/
├── api/                          # Funciones serverless de Vercel
│   ├── banxico.js               # Consulta API de Banxico
│   └── calcular-intereses.js    # Lógica completa del cálculo (Python→Node)
├── src/
│   ├── components/
│   │   ├── calculator/          # Calculadora de intereses
│   │   │   ├── InterestCalculator.jsx
│   │   │   └── InterestResultsTable.jsx
│   │   ├── questionnaire/       # Cuestionario de perfil
│   │   └── ui/                  # Componentes reutilizables
│   ├── services/
│   │   └── banxicoAPI.js        # (Ya no se usa, todo está en /api)
│   ├── data/                    # Datos estáticos
│   ├── hooks/                   # Custom hooks
│   ├── utils/                   # Utilidades
│   └── App.jsx                  # Componente principal
├── vite.config.js               # Plugin que simula serverless en dev
├── .env                         # Variables de entorno (NO subir)
├── .env.example                 # Ejemplo de variables
├── .gitignore                   # Archivos a ignorar
├── vercel.json                  # Configuración de Vercel
└── package.json
```

## 🔐 Seguridad

- ✅ El archivo `.env` está en `.gitignore` (no se sube a GitHub)
- ✅ En producción, el token se configura en las variables de entorno de Vercel
- ✅ Las funciones serverless manejan el token de forma segura
- ✅ No hay problemas de CORS porque todo el backend está en el mismo dominio

## 🔄 Cómo Funciona

### En Desarrollo (Local)
```
Browser → /api/calcular-intereses 
       ↓
Plugin de Vite (vite.config.js)
       ↓
Ejecuta lógica en Node.js
       ↓
Consulta Banxico API (con token desde .env)
       ↓
Devuelve resultado al navegador
```

### En Producción (Vercel)
```
Browser → /api/calcular-intereses
       ↓
Vercel Serverless Function (api/calcular-intereses.js)
       ↓
Ejecuta lógica en Node.js
       ↓
Consulta Banxico API (con token desde variables de entorno)
       ↓
Devuelve resultado al navegador
```

## 📝 Notas Importantes

### API de Banxico
- La API utiliza las series:
  - **SP68257:** Valor de UDI
  - **SF3368:** Costo de Captación Porcentual (CCP)
- Los datos de UDI están disponibles desde 1995
- El cálculo de intereses usa: `CCP × 1.25 ÷ 365 × días del mes`

### Lógica del Código Python
Todo el código Python ha sido convertido a JavaScript/Node.js:
- ✅ `obtenerSerieBanxico()` → Consulta series de Banxico
- ✅ `obtenerUDI()` → Obtiene UDI para una fecha
- ✅ `obtenerCCPMensual()` → Obtiene CCP entre fechas
- ✅ `generarTablaIntereses()` → Genera la tabla mensual completa

### Problemas Comunes

**Error: "No se pudo obtener UDI"**
- Verifica que el token de Banxico esté configurado correctamente
- Asegúrate de que las fechas sean válidas (formato: YYYY-MM-DD)
- Verifica que existan datos para esas fechas en Banxico

**Error: "Token de Banxico no configurado"**
- En local: Verifica que el archivo `.env` exista con `VITE_BANXICO_TOKEN`
- En Vercel: Verifica que la variable `BANXICO_TOKEN` esté configurada

**Error en despliegue de Vercel**
- Asegúrate de que el archivo `vercel.json` esté en la raíz
- Verifica que los archivos en `/api/` estén presentes
- Revisa los logs del build en el dashboard de Vercel

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Modo desarrollo
npm run build    # Construir para producción
npm run preview  # Vista previa del build
```

## 📄 Licencia

Este proyecto es privado y no está bajo ninguna licencia de código abierto.
