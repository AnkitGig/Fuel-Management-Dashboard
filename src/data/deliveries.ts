// src/data/deliveries.ts
import { FuelDelivery } from '@/types/fuel';
import { generateId } from '@/lib/utils';

export const mockDeliveries: FuelDelivery[] = [
  { id: generateId(), deliveryId: 'DEL-001', date: '2026-08-12', time: '11:45', quantity: 2500, supplier: 'FuelCo Ltd', status: 'Completed', createdAt: '2026-08-12T11:45:00Z', updatedAt: '2026-08-12T11:45:00Z' },
  { id: generateId(), deliveryId: 'DEL-002', date: '2026-08-10', time: '09:30', quantity: 3500, supplier: 'Petro Supplies', status: 'Completed', createdAt: '2026-08-10T09:30:00Z', updatedAt: '2026-08-10T09:30:00Z' },
  { id: generateId(), deliveryId: 'DEL-003', date: '2026-08-08', time: '14:15', quantity: 3000, supplier: 'Energy Plus', status: 'Completed', createdAt: '2026-08-08T14:15:00Z', updatedAt: '2026-08-08T14:15:00Z' },
  { id: generateId(), deliveryId: 'DEL-004', date: '2026-08-05', time: '10:00', quantity: 5000, supplier: 'FuelCo Ltd', status: 'Completed', createdAt: '2026-08-05T10:00:00Z', updatedAt: '2026-08-05T10:00:00Z' },
  { id: generateId(), deliveryId: 'DEL-005', date: '2026-08-03', time: '16:30', quantity: 2800, supplier: 'Petro Supplies', status: 'Pending', createdAt: '2026-08-03T16:30:00Z', updatedAt: '2026-08-03T16:30:00Z' },
  { id: generateId(), deliveryId: 'DEL-006', date: '2026-07-31', time: '08:15', quantity: 3200, supplier: 'Energy Plus', status: 'Completed', createdAt: '2026-07-31T08:15:00Z', updatedAt: '2026-07-31T08:15:00Z' },
  { id: generateId(), deliveryId: 'DEL-007', date: '2026-07-28', time: '13:45', quantity: 4100, supplier: 'FuelCo Ltd', status: 'Completed', createdAt: '2026-07-28T13:45:00Z', updatedAt: '2026-07-28T13:45:00Z' },
  { id: generateId(), deliveryId: 'DEL-008', date: '2026-07-25', time: '10:30', quantity: 2800, supplier: 'Petro Supplies', status: 'Cancelled', createdAt: '2026-07-25T10:30:00Z', updatedAt: '2026-07-25T10:30:00Z' },
  { id: generateId(), deliveryId: 'DEL-009', date: '2026-07-22', time: '15:00', quantity: 3500, supplier: 'Energy Plus', status: 'Completed', createdAt: '2026-07-22T15:00:00Z', updatedAt: '2026-07-22T15:00:00Z' },
  { id: generateId(), deliveryId: 'DEL-010', date: '2026-07-19', time: '09:45', quantity: 4500, supplier: 'FuelCo Ltd', status: 'Completed', createdAt: '2026-07-19T09:45:00Z', updatedAt: '2026-07-19T09:45:00Z' },
  { id: generateId(), deliveryId: 'DEL-011', date: '2026-07-16', time: '11:30', quantity: 3000, supplier: 'Petro Supplies', status: 'Completed', createdAt: '2026-07-16T11:30:00Z', updatedAt: '2026-07-16T11:30:00Z' },
  { id: generateId(), deliveryId: 'DEL-012', date: '2026-07-13', time: '14:00', quantity: 3800, supplier: 'Energy Plus', status: 'Pending', createdAt: '2026-07-13T14:00:00Z', updatedAt: '2026-07-13T14:00:00Z' },
];