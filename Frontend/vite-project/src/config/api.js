const runtimeHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `http://${runtimeHost}:5000`;

export const apiUrl = (path) => {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

