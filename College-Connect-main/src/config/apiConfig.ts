const DEFAULT_API_BASE_URL =
  "https://college-connect-backend-51sw.onrender.com/api";

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

const ensureApiSuffix = (url: string) => {
  const normalizedUrl = trimTrailingSlash(url);
  return normalizedUrl.endsWith("/api") ? normalizedUrl : `${normalizedUrl}/api`;
};

export const API_BASE_URL = ensureApiSuffix(
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
);

export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api$/, "");
