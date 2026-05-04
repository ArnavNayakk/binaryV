const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const rawApiBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:4000" : "");

export const API_BASE_URL = trimTrailingSlash(rawApiBase);
export const SOCKET_BASE_URL = API_BASE_URL;
export const ASSET_BASE_URL = API_BASE_URL;
