// src/data/reconciliation.ts
import { Reconciliation } from '@/types/reconciliation';
import { generateId } from '@/lib/utils';

export const mockReconciliationData: Reconciliation[] = [
  { id: generateId(), date: '2026-08-12', openingBalance: 10000, deliveries: 2500, fuelIssues: 380, expectedClosing: 12120, actualClosing: 12150, variance: 30, status: 'Reconciled', createdAt: '2026-08-12T00:00:00Z', updatedAt: '2026-08-12T00:00:00Z' },
  { id: generateId(), date: '2026-08-11', openingBalance: 8500, deliveries: 0, fuelIssues: 420, expectedClosing: 8080, actualClosing: 8100, variance: 20, status: 'Reconciled', createdAt: '2026-08-11T00:00:00Z', updatedAt: '2026-08-11T00:00:00Z' },
  { id: generateId(), date: '2026-08-10', openingBalance: 7200, deliveries: 3500, fuelIssues: 390, expectedClosing: 10310, actualClosing: 10350, variance: 40, status: 'Warning', createdAt: '2026-08-10T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
  { id: generateId(), date: '2026-08-09', openingBalance: 6500, deliveries: 0, fuelIssues: 350, expectedClosing: 6150, actualClosing: 6200, variance: 50, status: 'Reconciled', createdAt: '2026-08-09T00:00:00Z', updatedAt: '2026-08-09T00:00:00Z' },
  { id: generateId(), date: '2026-08-08', openingBalance: 7800, deliveries: 3000, fuelIssues: 400, expectedClosing: 10400, actualClosing: 10500, variance: 100, status: 'Exception', createdAt: '2026-08-08T00:00:00Z', updatedAt: '2026-08-08T00:00:00Z' },
  { id: generateId(), date: '2026-08-07', openingBalance: 9200, deliveries: 0, fuelIssues: 380, expectedClosing: 8820, actualClosing: 8850, variance: 30, status: 'Reconciled', createdAt: '2026-08-07T00:00:00Z', updatedAt: '2026-08-07T00:00:00Z' },
  { id: generateId(), date: '2026-08-06', openingBalance: 10500, deliveries: 0, fuelIssues: 410, expectedClosing: 10090, actualClosing: 10100, variance: 10, status: 'Reconciled', createdAt: '2026-08-06T00:00:00Z', updatedAt: '2026-08-06T00:00:00Z' },
  { id: generateId(), date: '2026-08-05', openingBalance: 11800, deliveries: 5000, fuelIssues: 390, expectedClosing: 16410, actualClosing: 16450, variance: 40, status: 'Reconciled', createdAt: '2026-08-05T00:00:00Z', updatedAt: '2026-08-05T00:00:00Z' },
  { id: generateId(), date: '2026-08-04', openingBalance: 9800, deliveries: 0, fuelIssues: 360, expectedClosing: 9440, actualClosing: 9480, variance: 40, status: 'Reconciled', createdAt: '2026-08-04T00:00:00Z', updatedAt: '2026-08-04T00:00:00Z' },
  { id: generateId(), date: '2026-08-03', openingBalance: 10800, deliveries: 2800, fuelIssues: 350, expectedClosing: 13250, actualClosing: 13300, variance: 50, status: 'Warning', createdAt: '2026-08-03T00:00:00Z', updatedAt: '2026-08-03T00:00:00Z' },
];