// src/services/api.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClientConfig {
  name: string;
  clientid: string;
  userid: number;
  divisionid: number;
}

export const CLIENTS: ClientConfig[] = [
  { name: 'Client Name 1', clientid: '2591', userid: 2094, divisionid: 845 },
  { name: 'Client Name 2', clientid: '2591', userid: 2094, divisionid: 845 },
  { name: 'Client Name 4', clientid: '2591', userid: 2094, divisionid: 845 },
  { name: 'Client Name 5', clientid: '2591', userid: 2094, divisionid: 845 },
  { name: 'Client Name 6', clientid: '2591', userid: 2094, divisionid: 845 },
];

interface ClientStore {
  selectedClient: ClientConfig;
  selectClient: (client: ClientConfig) => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      selectedClient: CLIENTS[0],
      selectClient: (client) => set({ selectedClient: client }),
    }),
    {
      name: 'client-settings-storage',
    }
  )
);

const BASE_URL = 'https://api.fmafrica.com:4801';
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch(`${BASE_URL}/api/Users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'godfrey@mastersystems.com.pg',
      password: 'cIk_X!VCJ9J.eIyp',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with FMA API');
  }

  const data = await response.json();
  cachedToken = data.token;
  // Set expiry (default 1 hour for safety, ttl is longer)
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  return cachedToken!;
}

export async function fmaApiRequest<T>(endpoint: string, body: any): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}
