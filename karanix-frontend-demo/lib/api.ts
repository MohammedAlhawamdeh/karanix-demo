export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export interface Stop {
  name: string;
  location: { lat: number; lng: number };
}

export interface Pax {
  _id: string;
  name: string;
  seat?: string;
  checkedIn: boolean;
  checkInTime?: string;
  operation: string;
}

export interface VehiclePing {
  location: { lat: number; lng: number };
  speed?: number;
  recordedAt: string;
}

export interface Vehicle {
  _id: string;
  name: string;
  driverName: string;
  operation?: string;
  lastPing?: VehiclePing;
  pingHistory?: VehiclePing[];
}

export interface Operation {
  _id: string;
  title: string;
  date: string;
  status: 'planned' | 'active' | 'completed';
  pax: Pax[];
  vehicles: Vehicle[];
  stops: Stop[];
  notes?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'guide' | 'driver';
  };
}

export const apiFetch = async <T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: 'no-store'
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Request failed');
  }

  return res.json();
};

export const login = async (email: string, password: string) =>
  apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
