// Car Types
export interface Car {
  id: string;
  model: string;
  brand: string;
  year: number;
  sale_price: number;
  color?: string;
  vin?: string;
  description?: string;
}

export interface CarCreate {
  model: string;
  brand: string;
  year: number;
  sale_price: number;
  color?: string;
  vin?: string;
  description?: string;
}

export interface CarUpdate {
  model?: string;
  brand?: string;
  year?: number;
  sale_price?: number;
  color?: string;
  vin?: string;
  description?: string;
}

// Client Types
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

export interface ClientCreate {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

export interface ClientUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

// Import Types
export type ImportStatus = 
  | 'EN_PROCESO' 
  | 'EN_TRANSITO' 
  | 'EN_TALLER' 
  | 'EN_ADUANA' 
  | 'ENTREGADO';

export interface Import {
  id: string;
  car_id: string;
  client_id: string;
  costos_reales: Record<string, number>;
  costos_cliente: Record<string, number>;
  notes?: string;
  status: ImportStatus;
  created_at: string;
  updated_at: string;
  car?: Car;
  client?: Client;
}

export interface ImportCreate {
  car_id: string;
  client_id: string;
  costos_reales?: Record<string, number>;
  costos_cliente?: Record<string, number>;
  notes?: string;
  status?: ImportStatus;
}

export interface ImportUpdate {
  costos_reales?: Record<string, number>;
  costos_cliente?: Record<string, number>;
  notes?: string;
  status?: ImportStatus;
}

// Share Types
export interface ShareToken {
  token: string;
  share_url: string;
  expires_at: string;
  is_active: boolean;
  created_at?: string;
}

export interface ShareCreate {
  days_valid?: number;
}

export interface PublicImport {
  id: string;
  car_id: string;
  client_id: string;
  costos_cliente: Record<string, number>; // Solo costos_cliente, NO costos_reales
  notes?: string;
  status: ImportStatus;
  created_at: string;
  updated_at: string;
  car?: Car;
  client?: Client;
}
