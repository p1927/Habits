import { getBearer, getConfig } from './config';
import { dedupedGet } from './apiDedupe';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { apiUrl } = getConfig();
  const bearer = getBearer();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`);

  const base = apiUrl.replace(/\/$/, '');
  const resp = await fetch(`${base}${path}`, { ...init, headers });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new ApiError(resp.status, text || resp.statusText);
  }
  if (resp.status === 204) return undefined as T;
  return resp.json() as Promise<T>;
}

export function get<T>(path: string): Promise<T> {
  return dedupedGet(path, () => request<T>(path));
}
