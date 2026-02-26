/**
 * Frontend API client. Uses same-origin requests so in dev Vite proxies /api to the backend.
 * Tokens are stored in localStorage (MVP). Tradeoff: XSS can steal tokens; for production
 * consider httpOnly cookies for refresh token.
 */

const BASE_URL = "";

const ACCESS_TOKEN_KEY = "apex_access_token";
const REFRESH_TOKEN_KEY = "apex_refresh_token";

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

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
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
    }
  }
  return res;
}

export async function apiJson<T>(path: string, init?: ApiRequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText, code: "UNKNOWN" } }));
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? "Request failed");
  }
  return res.json() as Promise<T>;
}
