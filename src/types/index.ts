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

export interface StatusHistoryEntry {
  status: ImportStatus;
  changed_at: string;
  notes?: string;
}

export interface Import {
  id: string;
  car_id: string;
  client_id: string;
  costos_reales: Record<string, number>;
  costos_cliente: Record<string, number>;
  notes?: string;
  status: ImportStatus;
  fecha_tentativa_entrega?: string;
  status_history?: StatusHistoryEntry[];
  images?: string[];
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
  fecha_tentativa_entrega?: string;
}

export interface ImportUpdate {
  costos_reales?: Record<string, number>;
  costos_cliente?: Record<string, number>;
  costos_reales_to_delete?: string[];
  costos_cliente_to_delete?: string[];
  notes?: string;
  status?: ImportStatus;
  fecha_tentativa_entrega?: string;
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
  fecha_tentativa_entrega?: string;
  status_history?: StatusHistoryEntry[];
  images?: string[];
  created_at: string;
  updated_at: string;
  car?: Car;
  client?: Client;
}

export interface ImportHistory {
  history: StatusHistoryEntry[];
  current_status: ImportStatus;
  fecha_tentativa_entrega?: string;
}

// Image Types
export interface ImageUploadResponse {
  message: string;
  image_url: string;
  filename: string;
}

export interface ImageDeleteResponse {
  message: string;
}
