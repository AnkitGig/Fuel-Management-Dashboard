// src/data/fuelLevels.ts
import { FuelLevel } from '@/types/fuel';
import { generateId } from '@/lib/utils';

export const mockFuelLevels: FuelLevel[] = [
  { id: generateId(), date: '2026-08-12', time: '08:00', fuelLevel: 13500, percentage: 67.5, status: 'Normal', createdAt: '2026-08-12T08:00:00Z', updatedAt: '2026-08-12T08:00:00Z' },
  { id: generateId(), date: '2026-08-12', time: '06:00', fuelLevel: 13200, percentage: 66.0, status: 'Normal', createdAt: '2026-08-12T06:00:00Z', updatedAt: '2026-08-12T06:00:00Z' },
  { id: generateId(), date: '2026-08-11', time: '22:00', fuelLevel: 12800, percentage: 64.0, status: 'Normal', createdAt: '2026-08-11T22:00:00Z', updatedAt: '2026-08-11T22:00:00Z' },
  { id: generateId(), date: '2026-08-11', time: '18:00', fuelLevel: 12500, percentage: 62.5, status: 'Normal', createdAt: '2026-08-11T18:00:00Z', updatedAt: '2026-08-11T18:00:00Z' },
  { id: generateId(), date: '2026-08-11', time: '14:00', fuelLevel: 12100, percentage: 60.5, status: 'Normal', createdAt: '2026-08-11T14:00:00Z', updatedAt: '2026-08-11T14:00:00Z' },
  { id: generateId(), date: '2026-08-11', time: '10:00', fuelLevel: 11800, percentage: 59.0, status: 'Normal', createdAt: '2026-08-11T10:00:00Z', updatedAt: '2026-08-11T10:00:00Z' },
  { id: generateId(), date: '2026-08-11', time: '06:00', fuelLevel: 11500, percentage: 57.5, status: 'Normal', createdAt: '2026-08-11T06:00:00Z', updatedAt: '2026-08-11T06:00:00Z' },
  { id: generateId(), date: '2026-08-10', time: '22:00', fuelLevel: 11200, percentage: 56.0, status: 'Normal', createdAt: '2026-08-10T22:00:00Z', updatedAt: '2026-08-10T22:00:00Z' },
  { id: generateId(), date: '2026-08-10', time: '18:00', fuelLevel: 10800, percentage: 54.0, status: 'Normal', createdAt: '2026-08-10T18:00:00Z', updatedAt: '2026-08-10T18:00:00Z' },
  { id: generateId(), date: '2026-08-10', time: '14:00', fuelLevel: 10500, percentage: 52.5, status: 'Normal', createdAt: '2026-08-10T14:00:00Z', updatedAt: '2026-08-10T14:00:00Z' },
];