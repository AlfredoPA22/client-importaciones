import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { importsApi, shareApi } from '../services/api';
import type { Import, ShareToken } from '../types';
import './ImportDetail.css';

function ImportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [importData, setImportData] = useState<Import | null>(null);
  const [shareTokens, setShareTokens] = useState<ShareToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingShare, setLoadingShare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadImport();
      loadShares();
    }
  }, [id]);

  const loadImport = async () => {
    try {
      setLoading(true);
      const data = await importsApi.getById(id!);
      setImportData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la importación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadShares = async () => {
    try {
      const tokens = await shareApi.getShares(id!);
      setShareTokens(tokens);
    } catch (err) {
      console.error('Error al cargar tokens de compartir:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta importación?')) {
      return;
    }

    try {
      await importsApi.delete(id!);
      navigate('/imports');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la importación');
      console.error(err);
    }
  };

  const handleCreateShare = async () => {
    try {
      setLoadingShare(true);
      setShareError(null);
      const shareData = await shareApi.createShare(id!);
      const fullUrl = `${window.location.origin}/share/${shareData.token}`;
      setNewShareUrl(fullUrl);
      await loadShares();
    } catch (err: any) {
      setShareError(err.message || 'Error al generar URL compartida');
      console.error(err);
    } finally {
      setLoadingShare(false);
    }
  };

  const handleDeleteShare = async (token: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este token?')) {
      return;
    }

    try {
      await shareApi.deleteShare(id!, token);
      await loadShares();
      if (newShareUrl && newShareUrl.includes(token)) {
        setNewShareUrl(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error al desactivar token');
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URL copiada al portapapeles');
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
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
    return <div className="loading">Cargando...</div>;
  }

  if (error || !importData) {
    return <div className="error">{error || 'Importación no encontrada'}</div>;
  }

  const totalRealCosts = calculateTotalCosts(importData.costos_reales || {});
  const totalClientCosts = calculateTotalCosts(importData.costos_cliente || {});

  return (
    <div className="import-detail">
      <div className="page-header">
        <h1>Detalle de Importación</h1>
        <div className="header-actions">
          <Link to={`/imports/${id}/edit`} className="btn btn-primary">
            Editar
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Eliminar
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/imports')}>
            Volver
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-card">
          <h2>Información de la Importación</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">ID:</span>
              <span className="value">#{importData.id.slice(-6)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Estado:</span>
              <span className={getStatusClass(importData.status)}>
                {formatStatus(importData.status)}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Fecha de Creación:</span>
              <span className="value">
                {new Date(importData.created_at).toLocaleString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Última Actualización:</span>
              <span className="value">
                {new Date(importData.updated_at).toLocaleString()}
              </span>
            </div>
            {importData.notes && (
              <div className="detail-item full-width">
                <span className="label">Notas:</span>
                <span className="value">{importData.notes}</span>
              </div>
            )}
          </div>
        </div>

        {importData.car && (
          <div className="detail-card">
            <h2>Auto Asociado</h2>
            <div className="car-info-card">
              <div className="car-info-header">
                <h3>{importData.car.brand} {importData.car.model}</h3>
                <Link to={`/cars/${importData.car.id}`} className="btn btn-sm btn-secondary">
                  Ver Auto
                </Link>
              </div>
              <div className="car-info-details">
                <div className="car-info-item">
                  <span className="label">Año:</span>
                  <span className="value">{importData.car.year}</span>
                </div>
                <div className="car-info-item">
                  <span className="label">Precio de Venta:</span>
                  <span className="value">${importData.car.sale_price.toLocaleString()}</span>
                </div>
                {importData.car.color && (
                  <div className="car-info-item">
                    <span className="label">Color:</span>
                    <span className="value">{importData.car.color}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {importData.client && (
          <div className="detail-card">
            <h2>Cliente</h2>
            <div className="client-info-card">
              <div className="client-info-header">
                <h3>{importData.client.name}</h3>
                <Link to={`/clients/${importData.client.id}`} className="btn btn-sm btn-secondary">
                  Ver Cliente
                </Link>
              </div>
              <div className="client-info-details">
                {importData.client.email && (
                  <div className="client-info-item">
                    <span className="label">Email:</span>
                    <span className="value">{importData.client.email}</span>
                  </div>
                )}
                {importData.client.phone && (
                  <div className="client-info-item">
                    <span className="label">Teléfono:</span>
                    <span className="value">{importData.client.phone}</span>
                  </div>
                )}
                {importData.client.company && (
                  <div className="client-info-item">
                    <span className="label">Empresa:</span>
                    <span className="value">{importData.client.company}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="detail-card">
          <h2>Costos Reales (Solo Administrador)</h2>
          {Object.keys(importData.costos_reales || {}).length === 0 ? (
            <p className="empty-message">No hay costos reales registrados</p>
          ) : (
            <>
              <div className="costs-list">
                {Object.entries(importData.costos_reales || {}).map(([key, value]) => (
                  <div key={key} className="cost-item cost-real">
                    <span className="cost-label">{key}</span>
                    <span className="cost-value">${value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="costs-total costs-total-real">
                <strong>Total Costos Reales: ${totalRealCosts.toLocaleString()}</strong>
              </div>
            </>
          )}
        </div>

        <div className="detail-card">
          <h2>Costos Cliente (Visible para Cliente)</h2>
          {Object.keys(importData.costos_cliente || {}).length === 0 ? (
            <p className="empty-message">No hay costos cliente registrados</p>
          ) : (
            <>
              <div className="costs-list">
                {Object.entries(importData.costos_cliente || {}).map(([key, value]) => (
                  <div key={key} className="cost-item cost-client">
                    <span className="cost-label">{key}</span>
                    <span className="cost-value">${value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="costs-total costs-total-client">
                <strong>Total Costos Cliente: ${totalClientCosts.toLocaleString()}</strong>
              </div>
            </>
          )}
        </div>

        <div className="detail-card">
          <div className="card-header">
            <h2>Compartir con Cliente</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleCreateShare}
              disabled={loadingShare}
            >
              {loadingShare ? 'Generando...' : 'Generar URL Compartida'}
            </button>
          </div>

          {shareError && <div className="error">{shareError}</div>}

          {newShareUrl && (
            <div className="share-url-container">
              <p className="share-url-label">URL Generada:</p>
              <div className="share-url-box">
                <input
                  type="text"
                  readOnly
                  value={newShareUrl}
                  className="share-url-input"
                />
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => copyToClipboard(newShareUrl)}
                >
                  Copiar
                </button>
              </div>
              <p className="share-url-note">
                Esta URL permite al cliente ver su importación sin necesidad de autenticación.
                Solo mostrará los costos cliente, no los costos reales.
              </p>
            </div>
          )}

          {shareTokens.length > 0 && (
            <div className="share-tokens-list">
              <h3>Tokens Activos</h3>
              {shareTokens.map((token) => (
                <div key={token.token} className="share-token-item">
                  <div className="share-token-info">
                    <div className="share-token-url">
                      <strong>URL:</strong> {window.location.origin}/share/{token.token}
                    </div>
                    <div className="share-token-details">
                      <span>
                        <strong>Expira:</strong> {new Date(token.expires_at).toLocaleDateString()}
                      </span>
                      <span className={`share-token-status ${token.is_active ? 'active' : 'inactive'}`}>
                        {token.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="share-token-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => copyToClipboard(`${window.location.origin}/share/${token.token}`)}
                    >
                      Copiar
                    </button>
                    {token.is_active && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteShare(token.token)}
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportDetail;
