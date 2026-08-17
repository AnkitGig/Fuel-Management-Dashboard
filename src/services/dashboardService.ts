// src/services/dashboardService.ts
import { 
  mockTankStatus, 
  mockKPIData, 
  mockFuelLevelTrend, 
  mockDeliveryTrend,
  mockConsumptionTrend,
  mockVehicleFuelUsage,
  mockReconciliationSummary,
  mockRecentTransactions,
  mockRecentDeliveries,
  mockExceptions
} from '@/data/dashboard';
import { TankStatus, Transaction } from '@/types/fuel';
import { VehicleFuelUsage } from '@/types/vehicle';
import { ReconciliationSummary } from '@/types/reconciliation';
import { delay } from '@/lib/utils';

export interface DashboardData {
  tankStatus: TankStatus;
  kpiData: {
    fuelDelivered: number;
    fuelIssued: number;
    currentConsumption: number;
    vehicles: number;
    transactions: number;
    reconciliationStatus: 'Reconciled' | 'Warning' | 'Exception';
    variance: number;
  };
  fuelLevelTrend: Array<{ date: string; level: number }>;
  deliveryTrend: Array<{ date: string; amount: number }>;
  consumptionTrend: Array<{ date: string; consumption: number }>;
  vehicleFuelUsage: VehicleFuelUsage[];
  reconciliationSummary: ReconciliationSummary;
  recentTransactions: Transaction[];
  recentDeliveries: Array<{ id: string; date: string; time: string; quantity: number; supplier: string; status: string }>;
  exceptions: Array<{ id: string; date: string; type: string; description: string; severity: string }>;
}

// TODO: Replace with real API calls
export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    await delay(300);
    return {
      tankStatus: mockTankStatus,
      kpiData: mockKPIData,
      fuelLevelTrend: mockFuelLevelTrend,
      deliveryTrend: mockDeliveryTrend,
      consumptionTrend: mockConsumptionTrend,
      vehicleFuelUsage: mockVehicleFuelUsage,
      reconciliationSummary: mockReconciliationSummary,
      recentTransactions: mockRecentTransactions,
      recentDeliveries: mockRecentDeliveries,
      exceptions: mockExceptions,
    };
  },
};