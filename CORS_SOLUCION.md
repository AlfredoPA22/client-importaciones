# Solución al Error de CORS

## Explicación del Error

El error de CORS (Cross-Origin Resource Sharing) ocurre cuando:
- El frontend está en `http://localhost:3000`
- El backend está en `http://127.0.0.1:8000`
- El navegador bloquea las solicitudes porque son de orígenes diferentes

## Solución Implementada (Proxy de Vite)

He configurado un **proxy en Vite** que soluciona el problema en desarrollo:

1. El frontend ahora hace solicitudes a `/api` (mismo origen)
2. Vite redirige automáticamente `/api` a `http://127.0.0.1:8000`
3. Como las solicitudes parecen venir del mismo origen, no hay problema de CORS

### Configuración Actual

**vite.config.ts:**
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

**src/services/api.ts:**
- En desarrollo: usa `/api` (pasa por el proxy)
- En producción: usa `http://127.0.0.1:8000` directamente

## Solución Alternativa: Configurar CORS en el Backend

Si prefieres configurar CORS directamente en el backend FastAPI, agrega esto a tu aplicación:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Opciones de CORS más restrictivas (recomendado para producción):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Solo en desarrollo
        # Agregar tu dominio de producción aquí
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
```

## Verificación

Después de aplicar la solución del proxy:

1. Reinicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```

2. Verifica que las solicitudes ahora vayan a `/api/cars` en lugar de `http://127.0.0.1:8000/cars`

3. El error de CORS debería desaparecer

## Notas

- El proxy de Vite solo funciona en desarrollo (`npm run dev`)
- Para producción, necesitarás:
  - Configurar CORS en el backend, O
  - Usar un servidor proxy (nginx, etc.), O
  - Servir el frontend desde el mismo dominio que el backend

## Solución Recomendada

**Para desarrollo:** Usar el proxy de Vite (ya configurado) ✅

**Para producción:** Configurar CORS en el backend con los dominios específicos permitidos

