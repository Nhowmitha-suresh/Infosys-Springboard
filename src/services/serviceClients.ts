/**
 * Shared HTTP helper for the three teammate microservices that back the
 * Authentication, Model Versioning and Clinical Rule Engine screens.
 *
 * In development every base URL is a same-origin path (`/svc/...`) that the
 * Vite dev/preview server proxies to the real service (see vite.config.js),
 * so there are no CORS problems. Override with the VITE_* variables below
 * when the services live elsewhere (e.g. a deployed nginx).
 */
const trimSlash = (value: string) => value.replace(/\/+$/, '');

export const SPRING_API_URL = trimSlash(import.meta.env.VITE_SPRING_API_URL || '/svc/spring/api');
export const ML_API_URL = trimSlash(import.meta.env.VITE_ML_API_URL || '/svc/ml');
export const MONITORING_API_URL = trimSlash(import.meta.env.VITE_MONITORING_API_URL || '/svc/monitoring');

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | undefined | null>;
  serviceName: string;
  timeoutMs?: number;
}

export async function serviceRequest<T>(baseUrl: string, path: string, options: RequestOptions): Promise<T> {
  const { method = 'GET', body, token, query, serviceName, timeoutMs = 10000 } = options;

  let url = `${baseUrl}${path}`;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      // A proxy with no upstream (service not started) answers 500/502/503/504 with no JSON body.
      const upstreamDown = !data && [500, 502, 503, 504].includes(response.status);
      const message = upstreamDown
        ? `Cannot reach the ${serviceName}. Make sure it is running.`
        : data?.error || data?.message || `${serviceName} request failed (HTTP ${response.status}).`;
      throw new ServiceError(message, response.status);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    if ((error as Error)?.name === 'AbortError') {
      throw new ServiceError(`The ${serviceName} did not respond in time.`);
    }
    throw new ServiceError(`Cannot reach the ${serviceName}. Make sure it is running.`);
  } finally {
    window.clearTimeout(timer);
  }
}
