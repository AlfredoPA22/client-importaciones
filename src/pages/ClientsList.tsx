import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clientsApi } from '../services/api';
import type { Client } from '../types';
import './ClientsList.css';

function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientsApi.getAll();
      // Asegurarse de que siempre sea un array
      setClients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los clientes');
      console.error(err);
      setClients([]); // En caso de error, establecer un array vacío
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return;
    }

    try {
      await clientsApi.delete(id);
      setClients(clients.filter(client => client.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el cliente');
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
    <div className="clients-list">
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary" onClick={() => navigate('/clients/new')}>
          Nuevo Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <p>No hay clientes registrados</p>
          <button className="btn btn-primary" onClick={() => navigate('/clients/new')}>
            Crear primer cliente
          </button>
        </div>
      ) : (
        <div className="clients-grid">
          {clients.map((client) => (
            <div key={client.id} className="client-card">
              <div className="client-card-header">
                <h3>{client.name}</h3>
                {client.company && (
                  <span className="client-company">{client.company}</span>
                )}
              </div>
              <div className="client-card-body">
                {client.email && (
                  <div className="client-info">
                    <span className="label">Email:</span>
                    <span className="value">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="client-info">
                    <span className="label">Teléfono:</span>
                    <span className="value">{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="client-info">
                    <span className="label">Dirección:</span>
                    <span className="value">{client.address}</span>
                  </div>
                )}
                {client.notes && (
                  <p className="client-notes">{client.notes}</p>
                )}
              </div>
              <div className="client-card-actions">
                <Link to={`/clients/${client.id}`} className="btn btn-secondary">
                  Ver Detalle
                </Link>
                <Link to={`/clients/${client.id}/edit`} className="btn btn-outline">
                  Editar
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(client.id)}
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

export default ClientsList;

