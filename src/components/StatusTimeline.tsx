import type { StatusHistoryEntry, ImportStatus } from '../types';
import { formatearFechaHora } from '../utils/dateUtils';
import './StatusTimeline.css';

interface StatusTimelineProps {
  history: StatusHistoryEntry[];
  currentStatus: ImportStatus;
}

const getStatusLabel = (status: ImportStatus): string => {
  const labels: Record<ImportStatus, string> = {
    EN_PROCESO: 'En Proceso',
    EN_TRANSITO: 'En Tránsito',
    EN_TALLER: 'En Taller',
    EN_ADUANA: 'En Aduana',
    ENTREGADO: 'Entregado',
  };
  return labels[status] || status;
};

const getStatusColor = (status: ImportStatus): string => {
  const colors: Record<ImportStatus, string> = {
    EN_PROCESO: 'status-proceso',
    EN_TRANSITO: 'status-transito',
    EN_TALLER: 'status-taller',
    EN_ADUANA: 'status-aduana',
    ENTREGADO: 'status-entregado',
  };
  return colors[status] || 'status-default';
};

export default function StatusTimeline({ history, currentStatus }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="status-timeline-empty">
        <p>No hay historial de estados disponible</p>
      </div>
    );
  }

  // El historial viene ordenado cronológicamente (más antiguo primero) del backend
  // Para mejor UX, lo mostramos en orden cronológico (más antiguo arriba, más reciente abajo)
  // pero si viene desordenado, lo ordenamos
  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  );

  return (
    <div className="status-timeline">
      <h3 className="timeline-title">Historial de Estados</h3>
      <div className="timeline-container">
        {sortedHistory.map((entry, index) => {
          // El estado actual es el último en el historial ordenado (más reciente)
          // Verificamos que sea el último Y que coincida con el estado actual
          const isLast = index === sortedHistory.length - 1;
          const isCurrent = isLast && entry.status === currentStatus;
          
          return (
            <div key={`${entry.status}-${entry.changed_at}-${index}`} className="timeline-item">
              <div className="timeline-line" />
              <div className={`timeline-dot ${getStatusColor(entry.status)} ${isCurrent ? 'current' : ''}`}>
                {isCurrent && <div className="timeline-dot-inner" />}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className={`status-badge ${getStatusColor(entry.status)}`}>
                    {getStatusLabel(entry.status)}
                  </span>
                  {isCurrent && (
                    <span className="current-badge">Estado Actual</span>
                  )}
                </div>
                <div className="timeline-date">
                  {formatearFechaHora(entry.changed_at)}
                </div>
                {entry.notes && (
                  <div className="timeline-notes">
                    {entry.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

