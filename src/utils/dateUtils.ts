/**
 * Calcula los días restantes hasta la fecha de entrega
 * @param fechaISO - Fecha en formato ISO 8601
 * @returns Número de días restantes (negativo si está atrasado)
 */
export const calcularDiasRestantes = (fechaISO: string): number | null => {
  if (!fechaISO) return null;
  
  try {
    const fechaEntrega = new Date(fechaISO);
    const hoy = new Date();
    
    // Establecer horas a medianoche para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaEntrega.setHours(0, 0, 0, 0);
    
    const diferencia = fechaEntrega.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error al calcular días restantes:', error);
    return null;
  }
};

/**
 * Formatea una fecha en formato legible en español
 * @param fechaISO - Fecha en formato ISO 8601
 * @returns Fecha formateada (ej: "15 de enero de 2024")
 */
export const formatearFecha = (fechaISO: string): string => {
  if (!fechaISO) return '';
  
  try {
    return new Date(fechaISO).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return fechaISO;
  }
};

/**
 * Formatea una fecha y hora en formato legible en español
 * @param fechaISO - Fecha en formato ISO 8601
 * @returns Fecha y hora formateada (ej: "15 ene 2024, 14:30")
 */
export const formatearFechaHora = (fechaISO: string): string => {
  if (!fechaISO) return '';
  
  try {
    return new Date(fechaISO).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error al formatear fecha y hora:', error);
    return fechaISO;
  }
};

/**
 * Obtiene el color según los días restantes
 * @param dias - Número de días restantes
 * @returns Nombre de la clase CSS para el color
 */
export const obtenerColorDias = (dias: number | null): string => {
  if (dias === null) return 'dias-neutral';
  if (dias < 0) return 'dias-atrasado';
  if (dias === 0) return 'dias-hoy';
  if (dias <= 3) return 'dias-urgente';
  if (dias <= 7) return 'dias-proximo';
  return 'dias-normal';
};

/**
 * Obtiene el texto descriptivo según los días restantes
 * @param dias - Número de días restantes
 * @returns Texto descriptivo
 */
export const obtenerTextoDias = (dias: number | null): string => {
  if (dias === null) return 'Sin fecha tentativa';
  if (dias < 0) return `Atrasado ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'día' : 'días'}`;
  if (dias === 0) return 'Entrega hoy';
  if (dias === 1) return '1 día restante';
  return `${dias} días restantes`;
};

