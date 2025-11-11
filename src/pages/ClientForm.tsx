import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsApi } from '../services/api';
import type { ClientCreate, ClientUpdate } from '../types';
import './ClientForm.css';

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
}

function ClientForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<ClientCreate>({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      loadClient();
    }
  }, [id, isEdit]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const client = await clientsApi.getById(id!);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        company: client.company || '',
        notes: client.notes || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar el cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Validaciones
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true; // Email es opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true; // Teléfono es opcional
    // Permite números, espacios, guiones, paréntesis y el signo +
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
  };

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'El nombre es obligatorio';
        }
        if (value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        if (value.trim().length > 100) {
          return 'El nombre no puede exceder 100 caracteres';
        }
        break;

      case 'email':
        if (value.trim() && !validateEmail(value)) {
          return 'Ingrese un email válido (ejemplo: cliente@ejemplo.com)';
        }
        if (value.trim().length > 100) {
          return 'El email no puede exceder 100 caracteres';
        }
        break;

      case 'phone':
        if (value.trim() && !validatePhone(value)) {
          return 'Ingrese un teléfono válido (mínimo 7 dígitos)';
        }
        if (value.trim().length > 20) {
          return 'El teléfono no puede exceder 20 caracteres';
        }
        break;

      case 'company':
        if (value.trim().length > 100) {
          return 'El nombre de la empresa no puede exceder 100 caracteres';
        }
        break;

      case 'address':
        if (value.trim().length > 200) {
          return 'La dirección no puede exceder 200 caracteres';
        }
        break;

      case 'notes':
        if (value.trim().length > 500) {
          return 'Las notas no pueden exceder 500 caracteres';
        }
        break;

      default:
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validar todos los campos
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof ClientCreate] || '');
      if (error) {
        newErrors[key as keyof ValidationErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validar formulario
    if (!validateForm()) {
      setError('Por favor, corrija los errores en el formulario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEdit && id) {
        const updateData: ClientUpdate = {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
          company: formData.company.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        };
        await clientsApi.update(id, updateData);
      } else {
        const createData: ClientCreate = {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
          company: formData.company.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        };
        await clientsApi.create(createData);
      }
      navigate('/clients');
    } catch (err: any) {
      setError(err.message || 'Error al guardar el cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="client-form">
      <div className="page-header">
        <h1>{isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/clients')}>
          Volver
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="form-group">
          <label htmlFor="name">
            Nombre *
            {touched.name && errors.name && (
              <span className="error-message"> - {errors.name}</span>
            )}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={touched.name && errors.name ? 'input-error' : ''}
            maxLength={100}
            placeholder="Ingrese el nombre del cliente"
          />
          {touched.name && errors.name && (
            <span className="field-error">{errors.name}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">
              Email
              {touched.email && errors.email && (
                <span className="error-message"> - {errors.email}</span>
              )}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? 'input-error' : ''}
              maxLength={100}
              placeholder="cliente@ejemplo.com"
            />
            {touched.email && errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Teléfono
              {touched.phone && errors.phone && (
                <span className="error-message"> - {errors.phone}</span>
              )}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.phone && errors.phone ? 'input-error' : ''}
              maxLength={20}
              placeholder="+1 (555) 123-4567"
            />
            {touched.phone && errors.phone && (
              <span className="field-error">{errors.phone}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="company">
            Empresa
            {touched.company && errors.company && (
              <span className="error-message"> - {errors.company}</span>
            )}
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.company && errors.company ? 'input-error' : ''}
            maxLength={100}
            placeholder="Nombre de la empresa"
          />
          {touched.company && errors.company && (
            <span className="field-error">{errors.company}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="address">
            Dirección
            {touched.address && errors.address && (
              <span className="error-message"> - {errors.address}</span>
            )}
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.address && errors.address ? 'input-error' : ''}
            maxLength={200}
            placeholder="Dirección completa del cliente"
          />
          {touched.address && errors.address && (
            <span className="field-error">{errors.address}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">
            Notas
            {touched.notes && errors.notes && (
              <span className="error-message"> - {errors.notes}</span>
            )}
            <span className="char-count">
              {formData.notes.length}/500
            </span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.notes && errors.notes ? 'input-error' : ''}
            rows={4}
            maxLength={500}
            placeholder="Notas adicionales sobre el cliente..."
          />
          {touched.notes && errors.notes && (
            <span className="field-error">{errors.notes}</span>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/clients')}>
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

export default ClientForm;
