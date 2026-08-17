// src/data/dashboard.ts
import { TankStatus, Transaction } from '@/types/fuel';

export const mockTankStatus: TankStatus = {
  capacity: 20000,
  currentLevel: 13500,
  percentage: 67.5,
  status: 'Normal',
};

export const mockKPIData = {
  fuelDelivered: 15420,
  fuelIssued: 10280,
  currentConsumption: 340,
  vehicles: 24,
  transactions: 187,
  reconciliationStatus: 'Reconciled' as const,
  variance: 45,
};

export const mockFuelLevelTrend = [
  { date: '2026-08-01', level: 12000 },
  { date: '2026-08-02', level: 11500 },
  { date: '2026-08-03', level: 10800 },
  { date: '2026-08-04', level: 9800 },
  { date: '2026-08-05', level: 8500 },
  { date: '2026-08-06', level: 7200 },
  { date: '2026-08-07', level: 6500 },
  { date: '2026-08-08', level: 7800 },
  { date: '2026-08-09', level: 9200 },
  { date: '2026-08-10', level: 10500 },
  { date: '2026-08-11', level: 11800 },
  { date: '2026-08-12', level: 13500 },
];

export const mockDeliveryTrend = [
  { date: '2026-08-01', amount: 4000 },
  { date: '2026-08-03', amount: 3000 },
  { date: '2026-08-05', amount: 5000 },
  { date: '2026-08-08', amount: 3500 },
  { date: '2026-08-10', amount: 2500 },
  { date: '2026-08-12', amount: 4500 },
];

export const mockConsumptionTrend = [
  { date: '2026-08-01', consumption: 320 },
  { date: '2026-08-02', consumption: 280 },
  { date: '2026-08-03', consumption: 350 },
  { date: '2026-08-04', consumption: 290 },
  { date: '2026-08-05', consumption: 310 },
  { date: '2026-08-06', consumption: 270 },
  { date: '2026-08-07', consumption: 340 },
  { date: '2026-08-08', consumption: 300 },
  { date: '2026-08-09', consumption: 330 },
  { date: '2026-08-10', consumption: 280 },
  { date: '2026-08-11', consumption: 260 },
  { date: '2026-08-12', consumption: 340 },
];

export const mockVehicleFuelUsage = [
  { name: 'VH-1025', fuelUsed: 450 },
  { name: 'VH-1008', fuelUsed: 380 },
  { name: 'VH-1032', fuelUsed: 420 },
  { name: 'VH-1045', fuelUsed: 350 },
  { name: 'VH-1051', fuelUsed: 390 },
  { name: 'VH-1063', fuelUsed: 310 },
  { name: 'VH-1078', fuelUsed: 270 },
  { name: 'VH-1082', fuelUsed: 330 },
];

export const mockReconciliationSummary = {
  openingBalance: 10000,
  deliveries: 15420,
  fuelIssues: 10280,
  expectedClosing: 15140,
  actualClosing: 15195,
  variance: 55,
  status: 'Reconciled' as const,
};

export const mockRecentTransactions: Transaction[] = [
  { id: 'TXN-001', date: '2026-08-12 14:30', time: '14:30', type: 'issue', vehicleId: 'VH-1025', quantity: 45, status: 'Matched' },
  { id: 'TXN-002', date: '2026-08-12 13:15', time: '13:15', type: 'issue', vehicleId: 'VH-1008', quantity: 38, status: 'Matched' },
  { id: 'TXN-003', date: '2026-08-12 11:45', time: '11:45', type: 'delivery', quantity: 2500, status: 'Completed' },
  { id: 'TXN-004', date: '2026-08-12 10:20', time: '10:20', type: 'issue', vehicleId: 'VH-1032', quantity: 42, status: 'Matched' },
  { id: 'TXN-005', date: '2026-08-12 09:00', time: '09:00', type: 'issue', vehicleId: 'VH-1045', quantity: 35, status: 'Unmatched' },
];

export const mockRecentDeliveries = [
  { id: 'DEL-001', date: '2026-08-12', time: '11:45', quantity: 2500, supplier: 'FuelCo Ltd', status: 'Completed' },
  { id: 'DEL-002', date: '2026-08-10', time: '09:30', quantity: 3500, supplier: 'Petro Supplies', status: 'Completed' },
  { id: 'DEL-003', date: '2026-08-08', time: '14:15', quantity: 3000, supplier: 'Energy Plus', status: 'Completed' },
  { id: 'DEL-004', date: '2026-08-05', time: '10:00', quantity: 5000, supplier: 'FuelCo Ltd', status: 'Completed' },
  { id: 'DEL-005', date: '2026-08-03', time: '16:30', quantity: 2800, supplier: 'Petro Supplies', status: 'Pending' },
];

export const mockExceptions = [
  { id: 'EXC-001', date: '2026-08-12', type: 'Unmatched Transaction', description: 'Transaction TXN-005 has no matching vehicle', severity: 'Exception' },
  { id: 'EXC-002', date: '2026-08-11', type: 'Variance', description: 'Reconciliation variance of 45L detected', severity: 'Warning' },
  { id: 'EXC-003', date: '2026-08-10', type: 'Unmatched Transaction', description: 'Transaction TXN-012 has no matching vehicle', severity: 'Exception' },
];