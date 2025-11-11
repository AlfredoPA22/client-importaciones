import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { importsApi, carsApi, clientsApi } from '../services/api';
import type { Import, Car, Client } from '../types';
import './ImportsList.css';

function ImportsList() {
  const [imports, setImports] = useState<Import[]>([]);
  const [cars, setCars] = useState<Record<string, Car>>({});
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [importsData, carsData, clientsData] = await Promise.all([
        importsApi.getAll(),
        carsApi.getAll(),
        clientsApi.getAll(),
      ]);

      setImports(importsData);
      
      // Crear un mapa de autos por ID
      const carsMap: Record<string, Car> = {};
      carsData.forEach(car => {
        carsMap[car.id] = car;
      });
      setCars(carsMap);

      // Crear un mapa de clientes por ID
      const clientsMap: Record<string, Client> = {};
      clientsData.forEach(client => {
        clientsMap[client.id] = client;
      });
      setClients(clientsMap);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las importaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta importación?')) {
      return;
    }

    try {
      await importsApi.delete(id);
      setImports(imports.filter(imp => imp.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la importación');
      console.error(err);
    }
  };

  const getStatusClass = (status: string) => {
    return `status-badge status-${status.toLowerCase().replace('_', '-')}`;
  };

  const calculateTotalCosts = (costs: Record<string, number>) => {
    return Object.values(costs || {}).reduce((sum, cost) => sum + cost, 0);
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="imports-list">
      <div className="page-header">
        <h1>Importaciones</h1>
        <button className="btn btn-primary" onClick={() => navigate('/imports/new')}>
          Nueva Importación
        </button>
      </div>

      {imports.length === 0 ? (
        <div className="empty-state">
          <p>No hay importaciones registradas</p>
          <button className="btn btn-primary" onClick={() => navigate('/imports/new')}>
            Crear primera importación
          </button>
        </div>
      ) : (
        <div className="imports-table-container">
          <table className="imports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Auto</th>
                <th>Cliente</th>
                <th>Costo Cliente</th>
                <th>Estado</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {imports.map((imp) => {
                const car = cars[imp.car_id];
                const client = clients[imp.client_id];
                const totalClientCosts = calculateTotalCosts(imp.costos_cliente);
                return (
                  <tr key={imp.id}>
                    <td>#{imp.id.slice(-6)}</td>
                    <td>
                      {car ? (
                        <Link to={`/cars/${car.id}`} className="car-link">
                          {car.brand} {car.model} ({car.year})
                        </Link>
                      ) : (
                        <span className="text-muted">Auto no encontrado</span>
                      )}
                    </td>
                    <td>
                      {client ? (
                        <Link to={`/clients/${client.id}`} className="client-link">
                          {client.name}
                        </Link>
                      ) : (
                        <span className="text-muted">Cliente no encontrado</span>
                      )}
                    </td>
                    <td>${totalClientCosts.toLocaleString()}</td>
                    <td>
                      <span className={getStatusClass(imp.status)}>
                        {formatStatus(imp.status)}
                      </span>
                    </td>
                    <td>{new Date(imp.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/imports/${imp.id}`} className="btn btn-sm btn-secondary">
                          Ver
                        </Link>
                        <Link to={`/imports/${imp.id}/edit`} className="btn btn-sm btn-outline">
                          Editar
                        </Link>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(imp.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ImportsList;
