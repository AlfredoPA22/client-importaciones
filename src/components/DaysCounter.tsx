import { calcularDiasRestantes, formatearFecha, obtenerColorDias, obtenerTextoDias } from '../utils/dateUtils';
import './DaysCounter.css';

interface DaysCounterProps {
  fechaTentativaEntrega?: string;
  showDate?: boolean;
}

export default function DaysCounter({ fechaTentativaEntrega, showDate = true }: DaysCounterProps) {
  if (!fechaTentativaEntrega) {
    return (
      <div className="days-counter days-counter-empty">
        <div className="days-icon">📅</div>
        <div className="days-content">
          <div className="days-text">Sin fecha tentativa de entrega</div>
        </div>
      </div>
    );
  }

  const dias = calcularDiasRestantes(fechaTentativaEntrega);
  const colorClass = obtenerColorDias(dias);
  const textoDias = obtenerTextoDias(dias);
  const fechaFormateada = formatearFecha(fechaTentativaEntrega);

  return (
    <div className={`days-counter ${colorClass}`}>
      <div className="days-icon">
        {dias !== null && dias < 0 && '⚠️'}
        {dias !== null && dias >= 0 && dias <= 3 && '⏰'}
        {dias !== null && dias > 3 && '📅'}
        {dias === null && '📅'}
      </div>
      <div className="days-content">
        <div className="days-number">{textoDias}</div>
        {showDate && (
          <div className="days-date">{fechaFormateada}</div>
        )}
      </div>
    </div>
  );
}

