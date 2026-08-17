// src/data/fuelIssues.ts
import { FuelIssue } from '@/types/fuel';
import { generateId } from '@/lib/utils';

export const mockFuelIssues: FuelIssue[] = [
  { id: generateId(), transactionId: 'TXN-001', date: '2026-08-12', time: '14:30', vehicleId: 'VH-1025', fuelQuantity: 45, assetType: 'Truck', status: 'Matched', createdAt: '2026-08-12T14:30:00Z', updatedAt: '2026-08-12T14:30:00Z' },
  { id: generateId(), transactionId: 'TXN-002', date: '2026-08-12', time: '13:15', vehicleId: 'VH-1008', fuelQuantity: 38, assetType: 'Truck', status: 'Matched', createdAt: '2026-08-12T13:15:00Z', updatedAt: '2026-08-12T13:15:00Z' },
  { id: generateId(), transactionId: 'TXN-003', date: '2026-08-12', time: '10:20', vehicleId: 'VH-1032', fuelQuantity: 42, assetType: 'Bus', status: 'Matched', createdAt: '2026-08-12T10:20:00Z', updatedAt: '2026-08-12T10:20:00Z' },
  { id: generateId(), transactionId: 'TXN-004', date: '2026-08-12', time: '09:00', vehicleId: 'VH-1045', fuelQuantity: 35, assetType: 'Van', status: 'Unmatched', createdAt: '2026-08-12T09:00:00Z', updatedAt: '2026-08-12T09:00:00Z' },
  { id: generateId(), transactionId: 'TXN-005', date: '2026-08-11', time: '16:45', vehicleId: 'VH-1051', fuelQuantity: 52, assetType: 'Truck', status: 'Matched', createdAt: '2026-08-11T16:45:00Z', updatedAt: '2026-08-11T16:45:00Z' },
  { id: generateId(), transactionId: 'TXN-006', date: '2026-08-11', time: '14:30', vehicleId: 'VH-1063', fuelQuantity: 31, assetType: 'Van', status: 'Exception', createdAt: '2026-08-11T14:30:00Z', updatedAt: '2026-08-11T14:30:00Z' },
  { id: generateId(), transactionId: 'TXN-007', date: '2026-08-11', time: '11:15', vehicleId: 'VH-1078', fuelQuantity: 27, assetType: 'Car', status: 'Matched', createdAt: '2026-08-11T11:15:00Z', updatedAt: '2026-08-11T11:15:00Z' },
  { id: generateId(), transactionId: 'TXN-008', date: '2026-08-11', time: '09:30', vehicleId: 'VH-1082', fuelQuantity: 33, assetType: 'Truck', status: 'Matched', createdAt: '2026-08-11T09:30:00Z', updatedAt: '2026-08-11T09:30:00Z' },
  { id: generateId(), transactionId: 'TXN-009', date: '2026-08-10', time: '16:00', vehicleId: 'VH-1025', fuelQuantity: 48, assetType: 'Truck', status: 'Matched', createdAt: '2026-08-10T16:00:00Z', updatedAt: '2026-08-10T16:00:00Z' },
  { id: generateId(), transactionId: 'TXN-010', date: '2026-08-10', time: '13:30', vehicleId: 'VH-1008', fuelQuantity: 41, assetType: 'Truck', status: 'Unmatched', createdAt: '2026-08-10T13:30:00Z', updatedAt: '2026-08-10T13:30:00Z' },
  { id: generateId(), transactionId: 'TXN-011', date: '2026-08-10', time: '10:45', vehicleId: 'VH-1032', fuelQuantity: 39, assetType: 'Bus', status: 'Matched', createdAt: '2026-08-10T10:45:00Z', updatedAt: '2026-08-10T10:45:00Z' },
  { id: generateId(), transactionId: 'TXN-012', date: '2026-08-10', time: '08:15', vehicleId: 'VH-1045', fuelQuantity: 36, assetType: 'Van', status: 'Matched', createdAt: '2026-08-10T08:15:00Z', updatedAt: '2026-08-10T08:15:00Z' },
  { id: generateId(), transactionId: 'TXN-013', date: '2026-08-09', time: '15:30', vehicleId: 'VH-1051', fuelQuantity: 50, assetType: 'Truck', status: 'Exception', createdAt: '2026-08-09T15:30:00Z', updatedAt: '2026-08-09T15:30:00Z' },
  { id: generateId(), transactionId: 'TXN-014', date: '2026-08-09', time: '12:45', vehicleId: 'VH-1063', fuelQuantity: 29, assetType: 'Van', status: 'Matched', createdAt: '2026-08-09T12:45:00Z', updatedAt: '2026-08-09T12:45:00Z' },
  { id: generateId(), transactionId: 'TXN-015', date: '2026-08-09', time: '09:00', vehicleId: 'VH-1078', fuelQuantity: 24, assetType: 'Car', status: 'Matched', createdAt: '2026-08-09T09:00:00Z', updatedAt: '2026-08-09T09:00:00Z' },
];