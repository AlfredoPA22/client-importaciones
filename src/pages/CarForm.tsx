import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { carsApi } from '../services/api';
import type { CarCreate, CarUpdate } from '../types';
import './CarForm.css';

function CarForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<CarCreate>({
    model: '',
    brand: '',
    year: new Date().getFullYear(),
    sale_price: 0,
    color: '',
    vin: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      loadCar();
    }
  }, [id, isEdit]);

  const loadCar = async () => {
    try {
      setLoading(true);
      const car = await carsApi.getById(id!);
      setFormData({
        model: car.model,
        brand: car.brand,
        year: car.year,
        sale_price: car.sale_price,
        color: car.color || '',
        vin: car.vin || '',
        description: car.description || '',
      });
    } catch (err) {
      setError('Error al cargar el auto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && id) {
        const updateData: CarUpdate = {
          model: formData.model,
          brand: formData.brand,
          year: formData.year,
          sale_price: formData.sale_price,
          color: formData.color || undefined,
          vin: formData.vin || undefined,
          description: formData.description || undefined,
        };
        await carsApi.update(id, updateData);
      } else {
        await carsApi.create(formData);
      }
      navigate('/cars');
    } catch (err) {
      setError('Error al guardar el auto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'sale_price' ? Number(value) : value,
    }));
  };

  if (loading && isEdit) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="car-form">
      <div className="page-header">
        <h1>{isEdit ? 'Editar Auto' : 'Nuevo Auto'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/cars')}>
          Volver
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="brand">Marca *</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="model">Modelo *</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="year">Año *</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sale_price">Precio de Venta *</label>
            <input
              type="number"
              id="sale_price"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="color">Color</label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="vin">VIN</label>
          <input
            type="text"
            id="vin"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/cars')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CarForm;

