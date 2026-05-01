// Get the API URL from environment variables, fallback to empty string for relative proxy in dev
const API_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path: string) => {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};
