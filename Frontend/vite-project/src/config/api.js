const runtimeHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `http://${runtimeHost}:5000`;

export const apiUrl = (path) => `${API_BASE_URL}${path}`;
