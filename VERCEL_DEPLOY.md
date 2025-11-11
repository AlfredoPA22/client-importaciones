# Configuración para Deploy en Vercel

## Problema del 404

Si recibes un error 404 al recargar la página en Vercel, es porque Vercel está intentando buscar la ruta en el servidor. Este es un problema común en aplicaciones SPA (Single Page Applications).

## Solución

El archivo `vercel.json` ya está configurado para redirigir todas las rutas al `index.html`, permitiendo que React Router maneje el enrutamiento del lado del cliente.

## Configuración de Variables de Entorno

### 1. En Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega la variable de entorno:
   - **Nombre**: `VITE_API_URL`
   - **Valor**: URL de tu backend (ej: `https://tu-backend.vercel.app` o `https://api.tudominio.com`)
   - **Environments**: Selecciona Production, Preview y Development

### 2. Importante

**NO uses `http://localhost:8000` en producción**. Esta URL solo funciona en tu máquina local.

### 3. Opciones para la URL del Backend

- Si tu backend está en Vercel: `https://tu-backend-app.vercel.app`
- Si está en otro servidor: `https://api.tudominio.com`
- Si está en un servidor con IP: `http://tu-ip:8000` (no recomendado para producción)

## Después de Configurar

1. Haz commit y push de los cambios
2. Vercel desplegará automáticamente
3. Las variables de entorno se aplicarán en el próximo deploy

## Verificar la Configuración

Después del deploy, puedes verificar que la variable de entorno esté configurada correctamente:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Verifica que `VITE_API_URL` esté configurada

## Nota sobre CORS

Si tu backend está en un dominio diferente, asegúrate de que el backend tenga configurado CORS para permitir solicitudes desde tu dominio de Vercel.

Ejemplo en FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tu-frontend.vercel.app",
        "http://localhost:3000",  # Para desarrollo local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Solución de Problemas

### Error 404 al recargar
- ✅ Verifica que `vercel.json` esté en la raíz del proyecto
- ✅ Verifica que el archivo tenga el formato correcto

### Error de conexión con el backend
- ✅ Verifica que `VITE_API_URL` esté configurada en Vercel
- ✅ Verifica que la URL del backend sea correcta
- ✅ Verifica que el backend esté accesible desde internet
- ✅ Verifica la configuración de CORS en el backend

### El proxy no funciona en producción
- ✅ El proxy de Vite solo funciona en desarrollo
- ✅ En producción, usa `VITE_API_URL` para apuntar directamente al backend
- ✅ Asegúrate de que el backend tenga CORS configurado

