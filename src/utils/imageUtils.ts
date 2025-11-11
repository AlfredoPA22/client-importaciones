import { getServerBaseUrl } from '../services/api';

/**
 * Tipos de archivo de imagen permitidos
 */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Tamaño máximo de archivo en bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ValidationResult {
  valido: boolean;
  errores: string[];
}

/**
 * Valida un archivo de imagen
 * @param file - Archivo a validar
 * @returns Resultado de la validación con errores si los hay
 */
export const validarArchivo = (file: File): ValidationResult => {
  const errores: string[] = [];

  // Validar tipo de archivo por extensión
  const fileName = file.name.toLowerCase();
  const fileExtension = '.' + fileName.split('.').pop();
  
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    errores.push(`Tipo de archivo no permitido. Extensiones permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Validar tipo MIME (solo si está presente y no coincide)
  // Algunos navegadores pueden no proporcionar el MIME type correctamente
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    // Si la extensión es válida pero el MIME type no coincide, solo mostrar advertencia
    // pero no rechazar (algunos navegadores reportan MIME types incorrectos)
    if (ALLOWED_EXTENSIONS.includes(fileExtension)) {
      console.warn(`MIME type no coincide pero extensión es válida: ${file.type}`);
    } else {
      errores.push(`Tipo de archivo no permitido. Tipos permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    errores.push(`Archivo demasiado grande. Tamaño máximo: ${maxSizeMB}MB`);
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Obtiene la URL completa de una imagen
 * @param imagePath - Ruta relativa de la imagen (ej: "/uploads/imports/abc123.jpg")
 * @param baseUrl - URL base del servidor (opcional, se obtiene automáticamente si no se proporciona)
 * @returns URL completa de la imagen
 */
export const getImageUrl = (imagePath: string, baseUrl?: string): string => {
  if (!imagePath) {
    return '';
  }

  // Si la imagen ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si la imagen es una ruta absoluta (empieza con /), construir URL completa
  if (imagePath.startsWith('/')) {
    const serverUrl = baseUrl || getServerBaseUrl();
    return `${serverUrl}${imagePath}`;
  }

  // Si es una ruta relativa, asumir que está en /uploads/imports/
  const serverUrl = baseUrl || getServerBaseUrl();
  return `${serverUrl}/uploads/imports/${imagePath}`;
};

/**
 * Obtiene el nombre de archivo desde una ruta de imagen
 * @param imagePath - Ruta de la imagen (ej: "/uploads/imports/abc123.jpg")
 * @returns Nombre del archivo (ej: "abc123.jpg")
 */
export const getFilenameFromPath = (imagePath: string): string => {
  if (!imagePath) {
    return '';
  }
  // Extraer el nombre del archivo de la ruta
  return imagePath.split('/').pop() || '';
};

/**
 * Formatea el tamaño de archivo en formato legible
 * @param bytes - Tamaño en bytes
 * @returns Tamaño formateado (ej: "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

