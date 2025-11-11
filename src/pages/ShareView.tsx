import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shareApi } from '../services/api';
import type { PublicImport } from '../types';
import StatusTimeline from '../components/StatusTimeline';
import DaysCounter from '../components/DaysCounter';
import ImageGallery from '../components/ImageGallery';
import './ShareView.css';

function ShareView() {
  const { token } = useParams<{ token: string }>();
  const [importData, setImportData] = useState<PublicImport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadPublicImport();
    }
  }, [token]);

  const loadPublicImport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shareApi.getPublicImport(token!);
      setImportData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la importación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    return `status-badge status-${status.toLowerCase().replace('_', '-')}`;
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  const calculateTotalCosts = (costs: Record<string, number>) => {
    return Object.values(costs || {}).reduce((sum, cost) => sum + cost, 0);
  };

  if (loading) {
    return (
      <div className="share-view">
        <div className="share-container">
          <div className="loading">Cargando información de su importación...</div>
        </div>
      </div>
    );
  }

  if (error || !importData) {
    return (
      <div className="share-view">
        <div className="share-container">
          <div className="error-card">
            <h2>Error al cargar la importación</h2>
            <p>{error || 'Importación no encontrada o token inválido'}</p>
            <p className="error-note">
              Por favor, verifique que la URL sea correcta o contacte al administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalCosts = calculateTotalCosts(importData.costos_cliente || {});

  return (
    <div className="share-view">
      <div className="share-container">
        <div className="share-header">
          <h1>Información de su Importación</h1>
          <p className="share-subtitle">Detalles de su vehículo y costos</p>
        </div>

        <div className="share-content">
          <div className="share-card">
            <h2>Estado de la Importación</h2>
            <div className="status-section">
              <span className={getStatusClass(importData.status)}>
                {formatStatus(importData.status)}
              </span>
              <p className="status-description">
                {importData.status === 'EN_PROCESO' && 'Su importación está en proceso.'}
                {importData.status === 'EN_TRANSITO' && 'Su vehículo está en tránsito.'}
                {importData.status === 'EN_TALLER' && 'Su vehículo está en el taller.'}
                {importData.status === 'EN_ADUANA' && 'Su vehículo está en aduana.'}
                {importData.status === 'ENTREGADO' && 'Su vehículo ha sido entregado.'}
              </p>
            </div>
          </div>

          {importData.fecha_tentativa_entrega && (
            <div className="share-card">
              <DaysCounter fechaTentativaEntrega={importData.fecha_tentativa_entrega} />
            </div>
          )}

          {importData.status_history && importData.status_history.length > 0 && (
            <div className="share-card">
              <StatusTimeline
                history={importData.status_history}
                currentStatus={importData.status}
              />
            </div>
          )}

          {importData.car && (
            <div className="share-card">
              <h2>Información del Vehículo</h2>
              <div className="car-details">
                <div className="car-detail-item">
                  <span className="label">Marca:</span>
                  <span className="value">{importData.car.brand}</span>
                </div>
                <div className="car-detail-item">
                  <span className="label">Modelo:</span>
                  <span className="value">{importData.car.model}</span>
                </div>
                <div className="car-detail-item">
                  <span className="label">Año:</span>
                  <span className="value">{importData.car.year}</span>
                </div>
                {importData.car.color && (
                  <div className="car-detail-item">
                    <span className="label">Color:</span>
                    <span className="value">{importData.car.color}</span>
                  </div>
                )}
                {importData.car.vin && (
                  <div className="car-detail-item">
                    <span className="label">VIN:</span>
                    <span className="value">{importData.car.vin}</span>
                  </div>
                )}
                {importData.car.description && (
                  <div className="car-detail-item full-width">
                    <span className="label">Descripción:</span>
                    <span className="value">{importData.car.description}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {importData.client && (
            <div className="share-card">
              <h2>Información del Cliente</h2>
              <div className="client-details">
                <div className="client-detail-item">
                  <span className="label">Nombre:</span>
                  <span className="value">{importData.client.name}</span>
                </div>
                {importData.client.company && (
                  <div className="client-detail-item">
                    <span className="label">Empresa:</span>
                    <span className="value">{importData.client.company}</span>
                  </div>
                )}
                {importData.client.email && (
                  <div className="client-detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{importData.client.email}</span>
                  </div>
                )}
                {importData.client.phone && (
                  <div className="client-detail-item">
                    <span className="label">Teléfono:</span>
                    <span className="value">{importData.client.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="share-card">
            <h2>Costos de la Importación</h2>
            {Object.keys(importData.costos_cliente || {}).length === 0 ? (
              <p className="empty-message">No hay costos registrados</p>
            ) : (
              <>
                <div className="costs-list">
                  {Object.entries(importData.costos_cliente || {}).map(([key, value]) => (
                    <div key={key} className="cost-item">
                      <span className="cost-label">{key}</span>
                      <span className="cost-value">${value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="costs-total">
                  <strong>Total: ${totalCosts.toLocaleString()}</strong>
                </div>
              </>
            )}
          </div>

          {importData.notes && (
            <div className="share-card">
              <h2>Notas</h2>
              <p className="notes-text">{importData.notes}</p>
            </div>
          )}

          {importData.images && importData.images.length > 0 && (
            <div className="share-card">
              <h2>Imágenes de la Importación</h2>
              <ImageGallery
                images={importData.images}
                readOnly={true}
              />
            </div>
          )}

          <div className="share-footer">
            <p className="footer-note">
              Esta información es confidencial. Por favor, no comparta este enlace con terceros.
            </p>
            <p className="footer-date">
              Última actualización: {new Date(importData.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareView;

