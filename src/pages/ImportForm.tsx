import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { importsApi, carsApi, clientsApi } from '../services/api';
import type { ImportCreate, ImportUpdate, Car, Client } from '../types';
import './ImportForm.css';

interface CostEntry {
  id: string; // ID único para cada entrada
  name: string;
  realAmount: number;
  clientAmount: number;
}

function ImportForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const carIdFromQuery = searchParams.get('car_id');
  const clientIdFromQuery = searchParams.get('client_id');

  const [cars, setCars] = useState<Car[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<ImportCreate>({
    car_id: carIdFromQuery || '',
    client_id: clientIdFromQuery || '',
    costos_reales: {},
    costos_cliente: {},
    notes: '',
    status: 'EN_PROCESO',
    fecha_tentativa_entrega: '',
  });

  const [costEntries, setCostEntries] = useState<CostEntry[]>([]);
  const [originalCosts, setOriginalCosts] = useState<{ reales: Record<string, number>; cliente: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para generar un ID único
  const generateEntryId = () => {
    return `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    loadData();
    if (isEdit && id) {
      loadImport();
    } else {
      // Inicializar con un costo vacío para nueva importación
      setCostEntries([{ id: generateEntryId(), name: '', realAmount: 0, clientAmount: 0 }]);
    }
  }, [id, isEdit]);

  const loadData = async () => {
    try {
      const [carsData, clientsData] = await Promise.all([
        carsApi.getAll(),
        clientsApi.getAll(),
      ]);
      setCars(carsData);
      setClients(clientsData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  const loadImport = async () => {
    try {
      setLoading(true);
      const importData = await importsApi.getById(id!);
      const realCosts = importData.costos_reales || {};
      const clientCosts = importData.costos_cliente || {};
      
      // Guardar los costos originales para comparar después
      setOriginalCosts({
        reales: { ...realCosts },
        cliente: { ...clientCosts },
      });
      
      // Formatear fecha tentativa para el input (YYYY-MM-DD)
      // Usar la fecha local para evitar problemas de zona horaria
      let fechaTentativa = '';
      if (importData.fecha_tentativa_entrega) {
        const fecha = new Date(importData.fecha_tentativa_entrega);
        // Ajustar por zona horaria local
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        fechaTentativa = `${año}-${mes}-${dia}`;
      }
      
      setFormData({
        car_id: importData.car_id,
        client_id: importData.client_id,
        costos_reales: realCosts,
        costos_cliente: clientCosts,
        notes: importData.notes || '',
        status: importData.status,
        fecha_tentativa_entrega: fechaTentativa,
      });

      // Combinar costos_reales y costos_cliente en una sola estructura
      // Obtener todas las claves únicas de ambos objetos
      const allKeys = new Set([
        ...Object.keys(realCosts),
        ...Object.keys(clientCosts)
      ]);

      // Crear entradas combinadas con IDs únicos
      const entries: CostEntry[] = Array.from(allKeys).map(key => ({
        id: generateEntryId(),
        name: key,
        realAmount: realCosts[key] || 0,
        clientAmount: clientCosts[key] || 0,
      }));

      // Si no hay costos, inicializar con uno vacío
      setCostEntries(entries.length > 0 ? entries : [{ id: generateEntryId(), name: '', realAmount: 0, clientAmount: 0 }]);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la importación');
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
      // Convertir entradas combinadas a objetos separados
      const costos_reales: Record<string, number> = {};
      const costos_cliente: Record<string, number> = {};

      // Procesar costos: solo incluir los que tengan nombre válido y monto > 0
      costEntries.forEach(entry => {
        const trimmedName = entry.name.trim();
        if (trimmedName) {
          // Solo agregar costos con montos mayores a 0
          if (entry.realAmount > 0) {
            costos_reales[trimmedName] = entry.realAmount;
          }
          if (entry.clientAmount > 0) {
            costos_cliente[trimmedName] = entry.clientAmount;
          }
        }
      });

      if (isEdit && id) {
        // El backend soporta eliminación de costos usando los arrays:
        // - costos_reales_to_delete: array de nombres de costos a eliminar
        // - costos_cliente_to_delete: array de nombres de costos a eliminar
        
        // Identificar costos que se eliminaron
        const costosRealesToDelete: string[] = [];
        const costosClienteToDelete: string[] = [];
        
        if (originalCosts) {
          // Obtener todos los costos originales
          const originalRealKeys = Object.keys(originalCosts.reales);
          const originalClienteKeys = Object.keys(originalCosts.cliente);
          const newRealKeys = Object.keys(costos_reales);
          const newClienteKeys = Object.keys(costos_cliente);
          
          // Identificar costos que existían antes pero ya no están (eliminados)
          const deletedRealKeys = originalRealKeys.filter(key => !newRealKeys.includes(key));
          const deletedClienteKeys = originalClienteKeys.filter(key => !newClienteKeys.includes(key));
          
          // Agregar a los arrays de eliminación
          costosRealesToDelete.push(...deletedRealKeys);
          costosClienteToDelete.push(...deletedClienteKeys);
          
          console.log('Costos reales a eliminar:', deletedRealKeys);
          console.log('Costos cliente a eliminar:', deletedClienteKeys);
        }
        
        // Construir el objeto de actualización
        // Solo enviar costos_reales y costos_cliente si hay costos nuevos/actualizados
        // Siempre enviar los arrays de eliminación si hay costos a eliminar
        const updateData: ImportUpdate = {
          notes: formData.notes || undefined,
          status: formData.status,
        };
        
        // Incluir fecha tentativa de entrega si está presente
        if (formData.fecha_tentativa_entrega && formData.fecha_tentativa_entrega.trim()) {
          // Convertir fecha a ISO string (a medianoche en hora local, luego a UTC)
          // Usar el formato YYYY-MM-DD directamente con T00:00:00 para evitar problemas de zona horaria
          const fecha = new Date(formData.fecha_tentativa_entrega + 'T00:00:00');
          updateData.fecha_tentativa_entrega = fecha.toISOString();
        } else {
          // Si se eliminó la fecha, enviar null o undefined para eliminarla
          updateData.fecha_tentativa_entrega = undefined;
        }
        
        // Solo incluir costos_reales si hay costos nuevos/actualizados
        if (Object.keys(costos_reales).length > 0) {
          updateData.costos_reales = costos_reales;
        }
        
        // Solo incluir costos_cliente si hay costos nuevos/actualizados
        if (Object.keys(costos_cliente).length > 0) {
          updateData.costos_cliente = costos_cliente;
        }
        
        // Incluir arrays de eliminación si hay costos a eliminar
        if (costosRealesToDelete.length > 0) {
          updateData.costos_reales_to_delete = costosRealesToDelete;
        }
        
        if (costosClienteToDelete.length > 0) {
          updateData.costos_cliente_to_delete = costosClienteToDelete;
        }
        
        console.log('=== ACTUALIZANDO IMPORTACIÓN ===');
        console.log('Costos reales originales:', originalCosts?.reales);
        console.log('Costos cliente originales:', originalCosts?.cliente);
        console.log('Costos reales nuevos/actualizados:', costos_reales);
        console.log('Costos cliente nuevos/actualizados:', costos_cliente);
        console.log('Costos reales a eliminar:', costosRealesToDelete);
        console.log('Costos cliente a eliminar:', costosClienteToDelete);
        console.log('Datos completos a enviar:', JSON.stringify(updateData, null, 2));
        
        await importsApi.update(id, updateData);
      } else {
        // En modo creación, solo enviar si hay costos
        const createData: ImportCreate = {
          car_id: formData.car_id,
          client_id: formData.client_id,
          costos_reales: Object.keys(costos_reales).length > 0 ? costos_reales : undefined,
          costos_cliente: Object.keys(costos_cliente).length > 0 ? costos_cliente : undefined,
          notes: formData.notes || undefined,
          status: formData.status,
        };
        
        // Incluir fecha tentativa de entrega si está presente
        if (formData.fecha_tentativa_entrega && formData.fecha_tentativa_entrega.trim()) {
          // Convertir fecha a ISO string (a medianoche en hora local, luego a UTC)
          const fecha = new Date(formData.fecha_tentativa_entrega + 'T00:00:00');
          createData.fecha_tentativa_entrega = fecha.toISOString();
        }
        
        await importsApi.create(createData);
      }
      navigate('/imports');
    } catch (err: any) {
      setError(err.message || 'Error al guardar la importación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCostEntryChange = (
    index: number,
    field: 'name' | 'realAmount' | 'clientAmount',
    value: string | number
  ) => {
    const newEntries = [...costEntries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value,
    };
    setCostEntries(newEntries);
  };

  const addCostEntry = () => {
    setCostEntries([...costEntries, { id: generateEntryId(), name: '', realAmount: 0, clientAmount: 0 }]);
  };

  const removeCostEntry = (entryId: string) => {
    const newEntries = costEntries.filter(entry => entry.id !== entryId);
    // Si se eliminan todos, agregar uno vacío para que el formulario siga funcionando
    if (newEntries.length === 0) {
      setCostEntries([{ id: generateEntryId(), name: '', realAmount: 0, clientAmount: 0 }]);
    } else {
      setCostEntries(newEntries);
    }
  };

  const calculateTotalReal = () => {
    return costEntries.reduce((sum, entry) => sum + entry.realAmount, 0);
  };

  const calculateTotalClient = () => {
    return costEntries.reduce((sum, entry) => sum + entry.clientAmount, 0);
  };

  if (loading && isEdit) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="import-form">
      <div className="page-header">
        <h1>{isEdit ? 'Editar Importación' : 'Nueva Importación'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/imports')}>
          Volver
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="car_id">Auto *</label>
            <select
              id="car_id"
              name="car_id"
              value={formData.car_id}
              onChange={handleChange}
              required
              disabled={isEdit}
            >
              <option value="">Seleccione un auto</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} ({car.year}) - ${car.sale_price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="client_id">Cliente *</label>
            <select
              id="client_id"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              required
              disabled={isEdit}
            >
              <option value="">Seleccione un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.company ? `- ${client.company}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Estado *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="EN_PROCESO">En Proceso</option>
              <option value="EN_TRANSITO">En Tránsito</option>
              <option value="EN_TALLER">En Taller</option>
              <option value="EN_ADUANA">En Aduana</option>
              <option value="ENTREGADO">Entregado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha_tentativa_entrega">Fecha Tentativa de Entrega</label>
            <input
              type="date"
              id="fecha_tentativa_entrega"
              name="fecha_tentativa_entrega"
              value={formData.fecha_tentativa_entrega || ''}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
            <small className="form-help">
              Fecha estimada para la entrega del vehículo
            </small>
          </div>
        </div>

        <div className="costs-section">
          <h3>Costos de la Importación</h3>
          <p className="costs-description">
            Agregue los costos de la importación. El monto real es solo para administradores, 
            el monto cliente es lo que verá el cliente.
          </p>
          <div className="costs-container">
            <div className="costs-header">
              <div className="cost-header-name">Nombre del Costo</div>
              <div className="cost-header-real">Monto Real</div>
              <div className="cost-header-client">Monto Cliente</div>
              <div className="cost-header-actions">Acciones</div>
            </div>
            {costEntries.map((entry) => {
              const index = costEntries.findIndex(e => e.id === entry.id);
              return (
                <div key={entry.id} className="cost-entry-unified">
                  <div className="cost-field-group">
                    <label className="cost-label-mobile">Nombre del Costo</label>
                    <input
                      type="text"
                      className="cost-input-name"
                      placeholder="Ej: Flete, Seguro, Aduana..."
                      value={entry.name}
                      onChange={(e) => handleCostEntryChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="cost-field-group">
                    <label className="cost-label-mobile cost-label-real">Monto Real</label>
                    <input
                      type="number"
                      className="cost-input-real"
                      placeholder="0.00"
                      value={entry.realAmount || ''}
                      onChange={(e) => handleCostEntryChange(index, 'realAmount', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="cost-field-group">
                    <label className="cost-label-mobile cost-label-client">Monto Cliente</label>
                    <input
                      type="number"
                      className="cost-input-client"
                      placeholder="0.00"
                      value={entry.clientAmount || ''}
                      onChange={(e) => handleCostEntryChange(index, 'clientAmount', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm cost-remove-btn"
                    onClick={() => removeCostEntry(entry.id)}
                    title="Eliminar este costo"
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              className="btn btn-outline btn-sm add-cost-btn"
              onClick={addCostEntry}
            >
              + Agregar Costo
            </button>
          </div>
          <div className="costs-totals">
            <div className="cost-total-real">
              <strong>Total Real: ${calculateTotalReal().toLocaleString()}</strong>
            </div>
            <div className="cost-total-client">
              <strong>Total Cliente: ${calculateTotalClient().toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notas</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Notas adicionales sobre la importación..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/imports')}>
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

export default ImportForm;
