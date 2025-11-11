# Instrucciones de Uso

## Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Asegurarse de que el servidor backend esté corriendo en http://127.0.0.1:8000**

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir el navegador en:** http://localhost:3000

## Funcionalidades

### Gestión de Autos
- **Listar autos:** Ver todos los autos registrados en el sistema
- **Crear auto:** Agregar un nuevo auto con todos sus datos
- **Editar auto:** Modificar la información de un auto existente
- **Eliminar auto:** Remover un auto del sistema
- **Ver detalle:** Ver información completa de un auto y sus importaciones

### Gestión de Importaciones
- **Listar importaciones:** Ver todas las importaciones con información del auto asociado
- **Crear importación:** Crear una nueva importación para un auto
- **Editar importación:** Modificar costos, notas y estado de una importación
- **Eliminar importación:** Remover una importación del sistema
- **Ver detalle:** Ver información completa de una importación

## Características Especiales

- **Costos dinámicos:** Puedes agregar múltiples costos a una importación (Flete, Aduana, Impuestos, etc.)
- **Cálculo automático:** El sistema calcula automáticamente el total de costos
- **Estados de importación:** EN_PROCESO, COMPLETADA, CANCELADA
- **Navegación fluida:** Enlaces entre autos e importaciones para una navegación fácil
- **Diseño responsive:** La interfaz se adapta a diferentes tamaños de pantalla

## Notas Importantes

- El sistema no requiere autenticación
- Todos los campos marcados con * son obligatorios
- Los costos pueden dejarse vacíos si no hay costos asociados
- Al editar una importación, los costos se fusionan con los existentes (no se reemplazan completamente)
- El auto asociado a una importación no puede cambiarse después de crear la importación

## Solución de Problemas

### Error de conexión con el backend
- Verifica que el servidor backend esté corriendo en http://127.0.0.1:8000
- Verifica la configuración en `src/services/api.ts`

### Error de CORS
- Asegúrate de que el backend tenga configurado CORS para permitir solicitudes desde http://localhost:3000

### Problemas con los tipos
- Verifica que todos los tipos estén correctamente definidos en `src/types/index.ts`

