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
  ImportHistory,
  ImageUploadResponse,
  ImageDeleteResponse,
} from '../types';

// Usar proxy de Vite en desarrollo para evitar problemas de CORS
// El proxy está configurado en vite.config.ts para redirigir /api a http://127.0.0.1:8000
// En Vite, import.meta.env es siempre disponible en tiempo de compilación
// Los tipos están definidos en vite-env.d.ts mediante la referencia a vite/client
const API_BASE_URL = (() => {
  // Vite provee import.meta.env con tipos definidos en vite/client
  // En desarrollo, MODE será 'development' y DEV será true
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  if (isDev) {
    return '/api';
  }
  
  // En producción, usar la variable de entorno o el valor por defecto
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
})();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// URL base del servidor para construir URLs completas de imágenes
export const getServerBaseUrl = (): string => {
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  if (isDev) {
    // En desarrollo, usar la URL del backend directamente
    return 'http://127.0.0.1:8000';
  }
  
  // En producción, usar la variable de entorno o el valor por defecto
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

// Error handler
interface AxiosErrorType {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
  };
  request?: unknown;
  message?: string;
}

const handleError = (error: unknown) => {
  const axiosError = error as AxiosErrorType;
  if (axiosError.response) {
    throw new Error(axiosError.response.data?.detail || 'Error en la solicitud');
  } else if (axiosError.request) {
    throw new Error('No se pudo conectar con el servidor');
  } else {
    throw new Error(axiosError.message || 'Error desconocido');
  }
};

// Cars API
export const carsApi = {
  getAll: async (): Promise<Car[]> => {
    try {
      const response = await api.get<Car[]>('/cars');
      // Asegurarse de que siempre devolvamos un array
      return Array.isArray(response.data) ? response.data : [];
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
      // Asegurarse de que siempre devolvamos un array
      return Array.isArray(response.data) ? response.data : [];
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
      // Asegurarse de que siempre devolvamos un array
      return Array.isArray(response.data) ? response.data : [];
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
      const response = await api.get(`/imports/car/${carId}`);
      console.log('=== getByCarId DEBUG ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      console.log('Response data keys:', response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A');
      
      const dataToProcess = response.data;
      
      // Si es un array, devolverlo directamente
      if (Array.isArray(dataToProcess)) {
        console.log('Returning array directly, length:', dataToProcess.length);
        return dataToProcess;
      }
      
      // Si es un objeto único de importación, convertirlo a array
      if (dataToProcess && typeof dataToProcess === 'object' && dataToProcess !== null) {
        const data = dataToProcess as Record<string, unknown>;
        
        // Primero verificar si hay una propiedad que contenga el array
        if ('data' in data && Array.isArray(data.data)) {
          console.log('Found data property with array');
          return data.data as Import[];
        }
        if ('imports' in data && Array.isArray(data.imports)) {
          console.log('Found imports property with array');
          return data.imports as Import[];
        }
        if ('items' in data && Array.isArray(data.items)) {
          console.log('Found items property with array');
          return data.items as Import[];
        }
        
        // Verificar si es un objeto de importación directamente (tiene id, car_id y client_id)
        // También verificar si tiene costos_reales o costos_cliente para mayor certeza
        const hasId = 'id' in data && typeof data.id === 'string';
        const hasCarId = 'car_id' in data && typeof data.car_id === 'string';
        const hasClientId = 'client_id' in data && typeof data.client_id === 'string';
        const hasCostos = ('costos_reales' in data || 'costos_cliente' in data);
        
        if (hasId && hasCarId && hasClientId) {
          console.log('✓ Single import object detected');
          console.log('  - Has id:', hasId, data.id);
          console.log('  - Has car_id:', hasCarId, data.car_id);
          console.log('  - Has client_id:', hasClientId, data.client_id);
          console.log('  - Has costos:', hasCostos);
          console.log('  - All keys:', Object.keys(data));
          
          // Convertir de forma segura a array
          const importObj = data as unknown as Import;
          console.log('✓ Converted to Import object, returning as array with 1 element');
          return [importObj];
        }
        
        // Si no coincide con ninguna estructura conocida, loggear información de debug
        console.warn('⚠ Object detected but does not match import structure');
        console.warn('  - Object keys:', Object.keys(data));
        console.warn('  - Has id?', hasId);
        console.warn('  - Has car_id?', hasCarId);
        console.warn('  - Has client_id?', hasClientId);
        console.warn('  - Has costos?', hasCostos);
        console.warn('  - Full object:', JSON.stringify(data, null, 2).substring(0, 500));
      }
      
      console.warn('Could not parse response as array, returning empty array');
      return [];
    } catch (error) {
      console.error('Error in getByCarId:', error);
      const axiosError = error as AxiosErrorType;
      // Si es un 404, puede ser que no haya importaciones (no es un error crítico)
      if (axiosError.response && 'status' in axiosError.response && axiosError.response.status === 404) {
        console.log('No imports found for car (404), returning empty array');
        return [];
      }
      // Para otros errores, lanzar el error
      handleError(error);
      throw error;
    }
  },

  getByClientId: async (clientId: string): Promise<Import[]> => {
    try {
      const response = await api.get(`/imports/client/${clientId}`);
      console.log('Response from getByClientId:', response);
      
      // Si es un array, devolverlo directamente
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si es un objeto único de importación, convertirlo a array
      if (response.data && typeof response.data === 'object' && response.data !== null) {
        const data = response.data as Record<string, unknown>;
        
        // Verificar si es un objeto de importación (tiene id y client_id)
        if ('id' in data && 'client_id' in data && 'car_id' in data) {
          console.log('Single import object detected, converting to array');
          // Convertir de forma segura
          return [data as unknown as Import];
        }
        
        // Si es un objeto con una propiedad que contiene el array
        if ('data' in data && Array.isArray(data.data)) {
          return data.data as Import[];
        }
        if ('imports' in data && Array.isArray(data.imports)) {
          return data.imports as Import[];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error in getByClientId:', error);
      const axiosError = error as AxiosErrorType;
      // Si es un 404, puede ser que no haya importaciones (no es un error crítico)
      if (axiosError.response && axiosError.response.status === 404) {
        console.log('No imports found for client (404), returning empty array');
        return [];
      }
      // Para otros errores, lanzar el error
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

  getHistory: async (id: string): Promise<ImportHistory> => {
    try {
      const response = await api.get<ImportHistory>(`/imports/${id}/history`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  uploadImage: async (id: string, file: File): Promise<ImageUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Para multipart/form-data, necesitamos eliminar el Content-Type por defecto
      // Crear una nueva instancia de axios para esta petición sin el header por defecto
      const uploadApi = axios.create({
        baseURL: API_BASE_URL,
        // No establecer headers por defecto, axios detectará FormData y establecerá
        // Content-Type automáticamente con el boundary correcto
      });
      
      const response = await uploadApi.post<ImageUploadResponse>(
        `/imports/${id}/images`,
        formData
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  deleteImage: async (id: string, filename: string): Promise<ImageDeleteResponse> => {
    try {
      const response = await api.delete<ImageDeleteResponse>(`/imports/${id}/images/${filename}`);
      return response.data;
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

  getShares: async (importId: string): Promise<ShareToken[]> => {
    try {
      const response = await api.get<ShareToken[]>(`/imports/${importId}/share`);
      // Asegurarse de que siempre devolvamos un array
      return Array.isArray(response.data) ? response.data : [];
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
