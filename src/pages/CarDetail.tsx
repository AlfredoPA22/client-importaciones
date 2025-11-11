import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { carsApi, importsApi } from '../services/api';
import type { Car, Import } from '../types';
import './CarDetail.css';

function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [imports, setImports] = useState<Import[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingImports, setLoadingImports] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importsError, setImportsError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCar();
      loadImports();
    }
  }, [id]);

  const loadCar = async () => {
    try {
      setLoading(true);
      const data = await carsApi.getById(id!);
      setCar(data);
    } catch (err) {
      setError('Error al cargar el auto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadImports = async () => {
    try {
      setLoadingImports(true);
      setImportsError(null);
      console.log('Cargando importaciones para auto ID:', id);
      const data = await importsApi.getByCarId(id!);
      console.log('Importaciones recibidas:', data);
      console.log('Tipo de datos:', typeof data);
      console.log('Es array?', Array.isArray(data));
      
      // Asegurarse de que siempre sea un array
      const importsArray = Array.isArray(data) ? data : [];
      console.log('Importaciones procesadas (array):', importsArray);
      console.log('Cantidad de importaciones:', importsArray.length);
      
      setImports(importsArray);
      
      // Si no hay importaciones, no es un error
      if (importsArray.length === 0) {
        console.log('No se encontraron importaciones para este auto');
      }
    } catch (err: any) {
      console.error('Error al cargar importaciones:', err);
      // Solo mostrar error si no es un 404 (que significa que no hay importaciones)
      if (err?.response?.status !== 404) {
        const errorMessage = err?.message || 'Error al cargar las importaciones';
        setImportsError(errorMessage);
      }
      // En caso de error, establecer un array vacío
      setImports([]);
    } finally {
      setLoadingImports(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este auto?')) {
      return;
    }

    try {
      await carsApi.delete(id!);
      navigate('/cars');
    } catch (err) {
      alert('Error al eliminar el auto');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error || !car) {
    return <div className="error">{error || 'Auto no encontrado'}</div>;
  }


  return (
    <div className="car-detail">
      <div className="page-header">
        <h1>Detalle del Auto</h1>
        <div className="header-actions">
          <Link to={`/cars/${id}/edit`} className="btn btn-primary">
            Editar
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Eliminar
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/cars')}>
            Volver
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-card">
          <h2>Información del Auto</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Marca:</span>
              <span className="value">{car.brand}</span>
            </div>
            <div className="detail-item">
              <span className="label">Modelo:</span>
              <span className="value">{car.model}</span>
            </div>
            <div className="detail-item">
              <span className="label">Año:</span>
              <span className="value">{car.year}</span>
            </div>
            <div className="detail-item">
              <span className="label">Precio de Venta:</span>
              <span className="value">${car.sale_price.toLocaleString()}</span>
            </div>
            {car.color && (
              <div className="detail-item">
                <span className="label">Color:</span>
                <span className="value">{car.color}</span>
              </div>
            )}
            {car.vin && (
              <div className="detail-item">
                <span className="label">VIN:</span>
                <span className="value">{car.vin}</span>
              </div>
            )}
            {car.description && (
              <div className="detail-item full-width">
                <span className="label">Descripción:</span>
                <span className="value">{car.description}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <h2>Importaciones</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={loadImports}
                disabled={loadingImports}
              >
                {loadingImports ? 'Cargando...' : 'Actualizar'}
              </button>
              <Link to={`/imports/new?car_id=${id}`} className="btn btn-primary btn-sm">
                Nueva Importación
              </Link>
            </div>
          </div>

          {loadingImports ? (
            <p className="empty-message">Cargando importaciones...</p>
          ) : importsError ? (
            <div className="error-message">
              <p>Error al cargar importaciones: {importsError}</p>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={loadImports}
                style={{ marginTop: '0.5rem' }}
              >
                Reintentar
              </button>
            </div>
          ) : !Array.isArray(imports) ? (
            <div className="error-message">
              <p>Error: Los datos recibidos no son un array válido</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Tipo recibido: {typeof imports}
              </p>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={loadImports}
                style={{ marginTop: '0.5rem' }}
              >
                Reintentar
              </button>
            </div>
          ) : imports.length === 0 ? (
            <div>
              <p className="empty-message">No hay importaciones para este auto</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
                Puedes crear una nueva importación usando el botón arriba
              </p>
            </div>
          ) : (
            <>
              <div className="imports-list">
                {imports.map((imp, index) => {
                  console.log(`Renderizando importación ${index}:`, imp);
                  const importCosts = Object.values(imp.costos_cliente || {}).reduce((sum, cost) => sum + cost, 0);
                  return (
                    <div key={imp.id || `import-${index}`} className="import-item">
                      <div className="import-header">
                        <Link to={`/imports/${imp.id}`} className="import-link">
                          Importación #{imp.id ? imp.id.slice(-6) : 'N/A'}
                        </Link>
                        <span className={`status-badge status-${imp.status?.toLowerCase().replace('_', '-') || 'en-proceso'}`}>
                          {imp.status ? imp.status.replace('_', ' ') : 'EN_PROCESO'}
                        </span>
                      </div>
                      {imp.client ? (
                        <div className="import-info">
                          <span className="label">Cliente:</span>
                          <span className="value">{imp.client.name}</span>
                        </div>
                      ) : imp.client_id ? (
                        <div className="import-info">
                          <span className="label">Cliente ID:</span>
                          <span className="value">{imp.client_id}</span>
                        </div>
                      ) : null}
                      <div className="import-info">
                        <span className="label">Costo Total Cliente:</span>
                        <span className="value">${importCosts.toLocaleString()}</span>
                      </div>
                      {imp.notes && (
                        <p className="import-notes">{imp.notes}</p>
                      )}
                      {imp.created_at && (
                        <div className="import-date">
                          Creado: {new Date(imp.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="imports-summary">
                <strong>Total de Costos de Importación: ${imports.reduce((sum, imp) => sum + Object.values(imp.costos_cliente || {}).reduce((s, c) => s + c, 0), 0).toLocaleString()}</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CarDetail;

