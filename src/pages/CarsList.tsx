import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { carsApi } from '../services/api';
import type { Car } from '../types';
import './CarsList.css';

function CarsList() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carsApi.getAll();
      // Asegurarse de que siempre sea un array
      setCars(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar los autos');
      console.error(err);
      setCars([]); // En caso de error, establecer un array vacío
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este auto?')) {
      return;
    }

    try {
      await carsApi.delete(id);
      setCars(cars.filter(car => car.id !== id));
    } catch (err) {
      alert('Error al eliminar el auto');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="cars-list">
      <div className="page-header">
        <h1>Autos</h1>
        <button className="btn btn-primary" onClick={() => navigate('/cars/new')}>
          Nuevo Auto
        </button>
      </div>

      {cars.length === 0 ? (
        <div className="empty-state">
          <p>No hay autos registrados</p>
          <button className="btn btn-primary" onClick={() => navigate('/cars/new')}>
            Crear primer auto
          </button>
        </div>
      ) : (
        <div className="cars-grid">
          {cars.map((car) => (
            <div key={car.id} className="car-card">
              <div className="car-card-header">
                <h3>{car.brand} {car.model}</h3>
                <span className="car-year">{car.year}</span>
              </div>
              <div className="car-card-body">
                <div className="car-info">
                  <span className="label">Precio de venta:</span>
                  <span className="value">${car.sale_price.toLocaleString()}</span>
                </div>
                {car.color && (
                  <div className="car-info">
                    <span className="label">Color:</span>
                    <span className="value">{car.color}</span>
                  </div>
                )}
                {car.vin && (
                  <div className="car-info">
                    <span className="label">VIN:</span>
                    <span className="value">{car.vin}</span>
                  </div>
                )}
                {car.description && (
                  <p className="car-description">{car.description}</p>
                )}
              </div>
              <div className="car-card-actions">
                <Link to={`/cars/${car.id}`} className="btn btn-secondary">
                  Ver Detalle
                </Link>
                <Link to={`/cars/${car.id}/edit`} className="btn btn-outline">
                  Editar
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(car.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CarsList;

