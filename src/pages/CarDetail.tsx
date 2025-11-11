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
  const [error, setError] = useState<string | null>(null);

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
      const data = await importsApi.getByCarId(id!);
      setImports(data);
    } catch (err) {
      console.error(err);
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
            <Link to={`/imports/new?car_id=${id}`} className="btn btn-primary btn-sm">
              Nueva Importación
            </Link>
          </div>

          {imports.length === 0 ? (
            <p className="empty-message">No hay importaciones para este auto</p>
          ) : (
            <div className="imports-list">
              {imports.map((imp) => {
                const importCosts = Object.values(imp.costos_cliente || {}).reduce((sum, cost) => sum + cost, 0);
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
                    {imp.client && (
                      <div className="import-info">
                        <span className="label">Cliente:</span>
                        <span className="value">{imp.client.name}</span>
                      </div>
                    )}
                    <div className="import-info">
                      <span className="label">Costo Total Cliente:</span>
                      <span className="value">${importCosts.toLocaleString()}</span>
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

          {imports.length > 0 && (
            <div className="imports-summary">
              <strong>Total de Costos de Importación: ${imports.reduce((sum, imp) => sum + Object.values(imp.costos_cliente || {}).reduce((s, c) => s + c, 0), 0).toLocaleString()}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CarDetail;

