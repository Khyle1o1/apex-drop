/**
 * Frontend API client. Uses same-origin requests so in dev Vite proxies /api to the backend.
 * Tokens are stored in localStorage (MVP). Tradeoff: XSS can steal tokens; for production
 * consider httpOnly cookies for refresh token.
 */

const BASE_URL = "";

const ACCESS_TOKEN_KEY = "apex_access_token";
const REFRESH_TOKEN_KEY = "apex_refresh_token";

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function handleUnauthorized(): void {
  clearTokens();
  if (unauthorizedHandler) unauthorizedHandler();
}

async function doRefreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) {
    handleUnauthorized();
    return null;
  }
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export interface ApiRequestInit extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export async function apiFetch(path: string, init: ApiRequestInit = {}): Promise<Response> {
  const { skipAuth, skipRefresh, ...fetchInit } = init;
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const headers = new Headers(fetchInit.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const access = skipAuth ? null : getAccessToken();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  let res = await fetch(url, { ...fetchInit, headers });
  if (res.status === 401 && !skipAuth && !skipRefresh) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(url, { ...fetchInit, headers });
    } else {
      // Refresh failed or no refresh token – treat as logged out.
      handleUnauthorized();
    }
  }
  return res;
}

export async function apiJson<T>(path: string, init?: ApiRequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const errBody = await res
      .json()
      .catch(() => ({ error: { message: res.statusText, code: "UNKNOWN" } }));
    const error = errBody as { error?: { message?: string; code?: string } };
    const message = error.error?.message ?? "Request failed";
    const code = error.error?.code ?? "UNKNOWN";
    const e = new Error(message) as Error & { code?: string; status?: number };
    e.code = code;
    e.status = res.status;
    // If backend says unauthorized but we somehow didn't run refresh logic (e.g. skipRefresh),
    // still clear session once.
    if (res.status === 401 || code === "UNAUTHORIZED") {
      handleUnauthorized();
    }
    throw e;
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}
