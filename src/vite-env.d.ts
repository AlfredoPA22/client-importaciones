/// <reference types="vite/client" />

// Extender los tipos de Vite para incluir nuestras variables de entorno personalizadas
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
