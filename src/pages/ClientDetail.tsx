import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientsApi, importsApi } from '../services/api';
import type { Client, Import } from '../types';
import './ClientDetail.css';

function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [imports, setImports] = useState<Import[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadClient();
      loadImports();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getById(id!);
      setClient(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadImports = async () => {
    try {
      const data = await importsApi.getByClientId(id!);
      // Asegurarse de que siempre sea un array
      setImports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar importaciones:', err);
      // En caso de error, establecer un array vacío
      setImports([]);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return;
    }

    try {
      await clientsApi.delete(id!);
      navigate('/clients');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el cliente');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error || !client) {
    return <div className="error">{error || 'Cliente no encontrado'}</div>;
  }

  return (
    <div className="client-detail">
      <div className="page-header">
        <h1>Detalle del Cliente</h1>
        <div className="header-actions">
          <Link to={`/clients/${id}/edit`} className="btn btn-primary">
            Editar
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Eliminar
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/clients')}>
            Volver
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-card">
          <h2>Información del Cliente</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Nombre:</span>
              <span className="value">{client.name}</span>
            </div>
            {client.company && (
              <div className="detail-item">
                <span className="label">Empresa:</span>
                <span className="value">{client.company}</span>
              </div>
            )}
            {client.email && (
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="detail-item">
                <span className="label">Teléfono:</span>
                <span className="value">{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="detail-item full-width">
                <span className="label">Dirección:</span>
                <span className="value">{client.address}</span>
              </div>
            )}
            {client.notes && (
              <div className="detail-item full-width">
                <span className="label">Notas:</span>
                <span className="value">{client.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <h2>Importaciones</h2>
            <Link to={`/imports/new?client_id=${id}`} className="btn btn-primary btn-sm">
              Nueva Importación
            </Link>
          </div>

          {!Array.isArray(imports) || imports.length === 0 ? (
            <p className="empty-message">No hay importaciones para este cliente</p>
          ) : (
            <div className="imports-list">
              {imports.map((imp) => {
                const clientCosts = Object.values(imp.costos_cliente || {}).reduce((sum, cost) => sum + cost, 0);
                return (
                  <div key={imp.id} className="import-item">
                    <div className="import-header">
                      <Link to={`/imports/${imp.id}`} className="import-link">
                        Importación #{imp.id.slice(-6)}
                      </Link>
                      <span className={`status-badge status-${imp.status.toLowerCase().replace('_', '-')}`}>
                        {imp.status.replace('_', ' ')}
                      </span>
                    </div>
                    {imp.car && (
                      <div className="import-info">
                        <span className="label">Auto:</span>
                        <span className="value">{imp.car.brand} {imp.car.model} ({imp.car.year})</span>
                      </div>
                    )}
                    <div className="import-info">
                      <span className="label">Costo Total Cliente:</span>
                      <span className="value">${clientCosts.toLocaleString()}</span>
                    </div>
                    {imp.notes && (
                      <p className="import-notes">{imp.notes}</p>
                    )}
                    <div className="import-date">
                      Creado: {new Date(imp.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientDetail;

