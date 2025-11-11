# Sistema de Importaciones - Frontend

Sistema completo de gestión de importaciones de autos desarrollado con React, TypeScript y Vite.

## Características

- ✅ Gestión completa de autos (CRUD)
- ✅ Gestión completa de clientes (CRUD)
- ✅ Gestión completa de importaciones (CRUD)
- ✅ Costos duales (reales para admin, cliente para público)
- ✅ Sistema de compartir URLs públicas para clientes
- ✅ Visualización de importaciones por auto y por cliente
- ✅ Cálculo automático de costos
- ✅ Interfaz moderna y responsive
- ✅ Integración con API FastAPI

## Tecnologías

- React 18
- TypeScript
- Vite
- React Router
- Axios
- CSS3 (sin frameworks)

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Servidor backend corriendo en http://localhost:8000

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Abrir el navegador en http://localhost:3000

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

```
src/
├── components/      # Componentes comunes
├── pages/          # Páginas principales
│   ├── CarsList.tsx
│   ├── CarForm.tsx
│   ├── CarDetail.tsx
│   ├── ClientsList.tsx
│   ├── ClientForm.tsx
│   ├── ClientDetail.tsx
│   ├── ImportsList.tsx
│   ├── ImportForm.tsx
│   ├── ImportDetail.tsx
│   └── ShareView.tsx (vista pública)
├── services/       # Servicios API
│   └── api.ts
├── types/          # Tipos TypeScript
│   └── index.ts
├── App.tsx         # Componente principal
├── main.tsx        # Punto de entrada
└── index.css       # Estilos globales
```

## Endpoints de la API

### Autos
- `GET /cars` - Listar todos los autos
- `GET /cars/{id}` - Obtener un auto por ID
- `POST /cars` - Crear un nuevo auto
- `PUT /cars/{id}` - Actualizar un auto
- `DELETE /cars/{id}` - Eliminar un auto

### Clientes
- `GET /clients` - Listar todos los clientes
- `GET /clients/{id}` - Obtener un cliente por ID
- `POST /clients` - Crear un nuevo cliente
- `PUT /clients/{id}` - Actualizar un cliente
- `DELETE /clients/{id}` - Eliminar un cliente

### Importaciones
- `GET /imports` - Listar todas las importaciones
- `GET /imports/{id}` - Obtener una importación por ID
- `GET /imports/car/{car_id}` - Obtener importaciones por auto
- `GET /imports/client/{client_id}` - Obtener importaciones por cliente
- `POST /imports` - Crear una nueva importación
- `PUT /imports/{id}` - Actualizar una importación (los costos se fusionan)
- `DELETE /imports/{id}` - Eliminar una importación

### Compartir URLs
- `POST /imports/{import_id}/share` - Generar URL compartida
- `GET /imports/{import_id}/share` - Listar tokens de una importación
- `DELETE /imports/{import_id}/share/{token}` - Desactivar token
- `GET /share/{token}` - Ver importación pública (solo costos_cliente)

## Características Principales

### Costos Duales

El sistema maneja dos tipos de costos:

1. **Costos Reales**: Solo visibles para administradores
   - Costos internos reales de la importación
   - No se muestran al cliente en URLs compartidas

2. **Costos Cliente**: Visibles para el cliente
   - Costos que se muestran al cliente
   - Aparecen en URLs compartidas públicas

### Estados de Importación

- `EN_PROCESO` - En proceso
- `EN_TRANSITO` - En tránsito
- `EN_TALLER` - En taller
- `EN_ADUANA` - En aduana
- `ENTREGADO` - Entregado

### Sistema de Compartir

1. El administrador genera una URL compartida desde el detalle de la importación
2. La URL es única y contiene un token
3. El cliente accede sin autenticación mediante `/share/{token}`
4. El cliente solo ve `costos_cliente`, NO ve `costos_reales`
5. Los tokens pueden expirar y desactivarse

## Configuración

El servidor API está configurado en `src/services/api.ts`. Por defecto:
- En desarrollo: usa proxy de Vite (`/api`) que redirige a `http://127.0.0.1:8000`
- En producción: usa `http://localhost:8000` o la variable de entorno `VITE_API_URL`

## Flujo de Trabajo

### Administrador

1. Crear cliente (POST /clients)
2. Crear auto (POST /cars)
3. Crear importación (POST /imports) con car_id, client_id, costos_reales, costos_cliente
4. Actualizar costos según avance (PUT /imports/{id})
5. Generar URL compartida (POST /imports/{import_id}/share)
6. Compartir URL con cliente

### Cliente

1. Recibir URL compartida
2. Acceder a `/share/{token}`
3. Ver su importación, auto y costos (solo costos_cliente)

## Notas

- El sistema no requiere autenticación
- Los campos marcados con * son obligatorios
- Los costos se pueden agregar dinámicamente
- Al editar una importación, los costos se fusionan (no se reemplazan)
- El auto y cliente asociados a una importación no pueden cambiarse después de crear

## Solución de Problemas

### Error de CORS

El proyecto usa un proxy de Vite en desarrollo para evitar problemas de CORS. Si aún tienes problemas:

1. Verifica que el servidor backend esté corriendo en http://127.0.0.1:8000
2. Verifica la configuración en `vite.config.ts`
3. Para producción, configura CORS en el backend

Ver `CORS_SOLUCION.md` para más detalles.

### Error de conexión con el backend

- Verifica que el servidor backend esté corriendo
- Verifica la configuración en `src/services/api.ts`
- Revisa la consola del navegador para errores específicos

## Desarrollo

### Agregar nuevos campos

1. Actualizar tipos en `src/types/index.ts`
2. Actualizar servicios en `src/services/api.ts`
3. Actualizar formularios en `src/pages/`
4. Actualizar componentes de visualización

### Personalizar estilos

Los estilos están en archivos CSS separados por componente. Las variables CSS están definidas en `src/index.css`.

## Producción

Para construir para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

Para previsualizar la build:

```bash
npm run preview
```

## Licencia

Este proyecto es privado y de uso interno.
