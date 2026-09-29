import { SPRING_API_URL, serviceRequest } from './serviceClients';

/**
 * Client for the Spring Boot + JWT authentication service
 * (services/Milestone4-Team-Backend, POST /api/auth/login|register, GET /api/auth/me).
 *
 * This is additive: the portal's existing local sign-in keeps working exactly as
 * before. The JWT session below is stored under its own keys so it can never
 * collide with the portal session (`medisphere_token`).
 */
export interface JwtUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'RECEPTIONIST' | string;
  specialization?: string | null;
}

interface AuthResponse {
  token: string;
  user: JwtUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  specialization?: string;
}

const TOKEN_KEY = 'medisphere_jwt';
const USER_KEY = 'medisphere_jwt_user';
const SERVICE = 'authentication service (Spring Boot, port 8080)';

export const authApi = {
  getToken: (): string | null => sessionStorage.getItem(TOKEN_KEY),

  getUser: (): JwtUser | null => {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as JwtUser) : null;
    } catch {
      return null;
    }
  },

  saveSession: (session: AuthResponse) => {
    sessionStorage.setItem(TOKEN_KEY, session.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(session.user));
  },

  clearSession: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  /** Reads the `exp` claim (ms epoch) from the JWT without verifying it. */
  getTokenExpiry: (token: string | null = sessionStorage.getItem(TOKEN_KEY)): number | null => {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const exp = JSON.parse(json)?.exp;
      return typeof exp === 'number' ? exp * 1000 : null;
    } catch {
      return null;
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const session = await serviceRequest<AuthResponse>(SPRING_API_URL, '/auth/login', {
      method: 'POST',
      body: { email: email.trim(), password },
      serviceName: SERVICE,
    });
    authApi.saveSession(session);
    return session;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const session = await serviceRequest<AuthResponse>(SPRING_API_URL, '/auth/register', {
      method: 'POST',
      body: {
        ...payload,
        name: payload.name.trim(),
        email: payload.email.trim(),
        specialization: payload.role === 'DOCTOR' ? payload.specialization?.trim() || undefined : undefined,
      },
      serviceName: SERVICE,
    });
    authApi.saveSession(session);
    return session;
  },

  /** Validates the stored token against the server and refreshes the cached user. */
  me: async (): Promise<JwtUser> => {
    const token = authApi.getToken();
    const user = await serviceRequest<JwtUser>(SPRING_API_URL, '/auth/me', {
      token,
      serviceName: SERVICE,
    });
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },
};
