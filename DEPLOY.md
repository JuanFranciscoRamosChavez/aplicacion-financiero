# 🚀 Guía Rápida de Despliegue en Vercel

## ⚠️ Importante para Desarrollo Local

**Si modificas el archivo `.env`, DEBES reiniciar el servidor de Vite:**
```bash
# Detén el servidor (Ctrl+C) y vuelve a ejecutar:
npm run dev
```

Vite solo carga las variables de entorno al iniciar, no en caliente.

## Antes de desplegar

1. ✅ Asegúrate de que `.gitignore` esté configurado (ya está listo)
2. ✅ NO subas el archivo `.env` a GitHub (ya está en .gitignore)
3. ✅ Ten a la mano tu token de Banxico

## Pasos para Desplegar

### 1️⃣ Subir a GitHub

```bash
# Si no has inicializado Git
git init
git add .
git commit -m "Initial commit"

# Conectar con GitHub (crear repo primero en github.com)
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### 2️⃣ Conectar con Vercel

1. Ve a https://vercel.com/new
2. Conecta tu cuenta de GitHub
3. Selecciona tu repositorio
4. Click en **"Import"**

### 3️⃣ Configurar Variables de Entorno

**IMPORTANTE:** Antes de hacer deploy, configura:

1. En la pantalla de configuración, ve a **"Environment Variables"**
2. Añade:
   - **Name:** `BANXICO_TOKEN`
   - **Value:** `bfd303ff4407d875d8ec5ab8fa685d3d5be369d220d9db488c8d3edc246ef502`
   - **Environments:** Selecciona Production, Preview y Development

### 4️⃣ Deploy

1. Click en **"Deploy"**
2. Espera 1-2 minutos
3. ¡Tu app estará lista! 🎉

## Para actualizar después

Simplemente haz push a GitHub:

```bash
git add .
git commit -m "Tu mensaje"
git push
```

Vercel desplegará automáticamente los cambios.

## Verificar que funciona

1. Ve a tu URL de Vercel (algo como: `tu-proyecto.vercel.app`)
2. Navega a **💰 Intereses Moratorios**
3. Prueba con:
   - Monto: 10000
   - Fecha inicio: 2024-01-01
   - Fecha final: 2024-12-31
4. Debe mostrar el cálculo sin errores

## ⚠️ Solución de Problemas

**"Cannot access environment variables"**
- Verifica que agregaste `BANXICO_TOKEN` en Vercel
- Asegúrate de NO usar el prefijo `VITE_` en producción

**"Failed to fetch"**
- Verifica que el archivo `api/banxico.js` exista
- Revisa los logs en Vercel Dashboard → Functions

**Build failed**
- Asegúrate que todos los archivos estén en Git
- Verifica que `package.json` tenga todas las dependencias
- Revisa los logs de build en Vercel

## 📞 Contacto

Si tienes problemas, revisa los logs en:
- Vercel Dashboard → Tu Proyecto → Deployments → Ver logs
