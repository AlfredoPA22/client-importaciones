import axios from 'axios';
import type {
  Car,
  CarCreate,
  CarUpdate,
  Client,
  ClientCreate,
  ClientUpdate,
  Import,
  ImportCreate,
  ImportUpdate,
  ShareToken,
  ShareCreate,
  PublicImport,
} from '../types';

// Usar proxy de Vite en desarrollo para evitar problemas de CORS
// El proxy está configurado en vite.config.ts para redirigir /api a http://127.0.0.1:8000
const API_BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
const handleError = (error: any) => {
  if (error.response) {
    throw new Error(error.response.data?.detail || 'Error en la solicitud');
  } else if (error.request) {
    throw new Error('No se pudo conectar con el servidor');
  } else {
    throw new Error(error.message || 'Error desconocido');
  }
};

// Cars API
export const carsApi = {
  getAll: async (): Promise<Car[]> => {
    try {
      const response = await api.get<Car[]>('/cars');
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Car> => {
    try {
      const response = await api.get<Car>(`/cars/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  create: async (car: CarCreate): Promise<Car> => {
    try {
      const response = await api.post<Car>('/cars', car);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  update: async (id: string, car: CarUpdate): Promise<Car> => {
    try {
      const response = await api.put<Car>(`/cars/${id}`, car);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/cars/${id}`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

// Clients API
export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    try {
      const response = await api.get<Client[]>('/clients');
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Client> => {
    try {
      const response = await api.get<Client>(`/clients/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  create: async (client: ClientCreate): Promise<Client> => {
    try {
      const response = await api.post<Client>('/clients', client);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  update: async (id: string, client: ClientUpdate): Promise<Client> => {
    try {
      const response = await api.put<Client>(`/clients/${id}`, client);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/clients/${id}`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

// Imports API
export const importsApi = {
  getAll: async (): Promise<Import[]> => {
    try {
      const response = await api.get<Import[]>('/imports');
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Import> => {
    try {
      const response = await api.get<Import>(`/imports/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getByCarId: async (carId: string): Promise<Import[]> => {
    try {
      const response = await api.get<Import[]>(`/imports/car/${carId}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getByClientId: async (clientId: string): Promise<Import[]> => {
    try {
      const response = await api.get<Import[]>(`/imports/client/${clientId}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  create: async (importData: ImportCreate): Promise<Import> => {
    try {
      const response = await api.post<Import>('/imports', importData);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  update: async (id: string, importData: ImportUpdate): Promise<Import> => {
    try {
      const response = await api.put<Import>(`/imports/${id}`, importData);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/imports/${id}`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

// Share API
export const shareApi = {
  createShare: async (importId: string, shareData?: ShareCreate): Promise<ShareToken> => {
    try {
      const response = await api.post<ShareToken>(`/imports/${importId}/share`, shareData || {});
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getPublicImport: async (token: string): Promise<PublicImport> => {
    try {
      const response = await api.get<PublicImport>(`/share/${token}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getShares: async (importId: string): Promise<ShareToken[]> => {
    try {
      const response = await api.get<ShareToken[]>(`/imports/${importId}/share`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  deleteShare: async (importId: string, token: string): Promise<void> => {
    try {
      await api.delete(`/imports/${importId}/share/${token}`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};
