export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const LAST_ERROR_REQUEST_ID_KEY = "last_error_request_id";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class ApiError extends Error {
  constructor(message, status, data = null, requestId = null) {
    super(message);

    this.name = "ApiError";

    this.status = status;

    this.data = data;

    this.requestId = requestId;
  }
}

export function resolverApiUrl(endpoint) {
  if (!endpoint) {
    return null;
  }

  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  return `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
}

function readCookie(name) {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;

  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  try {
    return decodeURIComponent(cookie.substring(prefix.length));
  } catch {
    return cookie.substring(prefix.length);
  }
}

async function ensureCsrfToken(signal) {
  let token = readCookie("XSRF-TOKEN");

  if (token) {
    return token;
  }

  let response;

  try {
    response = await fetch(`${API_URL}/auth/csrf`, {
      method: "GET",

      credentials: "include",

      cache: "no-store",

      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      "No fue posible inicializar la protección de seguridad.",
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      "No fue posible inicializar la protección de seguridad.",
      response.status,
    );
  }

  token = readCookie("XSRF-TOKEN");

  if (!token) {
    throw new ApiError("No fue posible obtener el token de seguridad.", 0);
  }

  return token;
}

function saveLastErrorRequestId(requestId) {
  if (!requestId || typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(LAST_ERROR_REQUEST_ID_KEY, requestId);
  } catch {
    // The request continues even when sessionStorage is unavailable.
  }
}

export function getLastErrorRequestId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage.getItem(LAST_ERROR_REQUEST_ID_KEY);
  } catch {
    return null;
  }
}

export function clearLastErrorRequestId() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(LAST_ERROR_REQUEST_ID_KEY);
  } catch {
    // Nothing else is required.
  }
}

export async function apiClient(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    ...restOptions
  } = options;

  const normalizedMethod = String(method).toUpperCase();

  const requestHeaders = {
    ...headers,
  };

  if (UNSAFE_METHODS.has(normalizedMethod)) {
    const csrfToken = await ensureCsrfToken(signal);

    requestHeaders["X-XSRF-TOKEN"] = csrfToken;
  }

  const requestOptions = {
    method: normalizedMethod,

    credentials: "include",

    cache: "no-store",

    signal,

    ...restOptions,
  };

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      requestOptions.body = body;
    } else {
      requestHeaders["Content-Type"] = "application/json";

      requestOptions.body = JSON.stringify(body);
    }
  }

  requestOptions.headers = requestHeaders;

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, requestOptions);
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError("No fue posible conectarse con el servidor.", 0);
  }

  let data = null;

  const contentType = response.headers.get("content-type");

  if (response.status !== 204) {
    try {
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = text || null;
      }
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const requestId =
      data?.requestId || response.headers.get("X-Request-ID") || null;

    saveLastErrorRequestId(requestId);

    const message =
      data?.message ||
      data?.mensaje ||
      (typeof data === "string" ? data : null) ||
      `Error ${response.status}`;

    throw new ApiError(message, response.status, data, requestId);
  }

  return data;
}
