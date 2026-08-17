// src/services/reconciliationService.ts
import { mockReconciliationData } from '@/data/reconciliation';
import { Reconciliation, ReconciliationSummary } from '@/types/reconciliation';
import { FilterParams, PaginatedResponse } from '@/types/common';
import { delay } from '@/lib/utils';
import { calculateReconciliation } from '@/lib/reconciliation';

// TODO: Replace with real Fuel Management API

export const reconciliationService = {
  async getReconciliationRecords(params: FilterParams = {}): Promise<PaginatedResponse<Reconciliation>> {
    await delay(300);
    
    let data = [...mockReconciliationData];
    
    // Apply filters
    if (params.startDate) {
      data = data.filter(item => item.date >= params.startDate!);
    }
    if (params.endDate) {
      data = data.filter(item => item.date <= params.endDate!);
    }
    if (params.status) {
      data = data.filter(item => item.status === params.status);
    }
    
    // Sort by date descending
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = data.slice(start, end);
    
    return {
      data: paginatedData,
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
    };
  },
  
  async getReconciliationById(id: string): Promise<Reconciliation | null> {
    await delay(200);
    return mockReconciliationData.find(r => r.id === id) || null;
  },
  
  async calculateReconciliation(
    openingBalance: number,
    deliveries: number,
    fuelIssues: number,
    actualClosing: number
  ): Promise<ReconciliationSummary> {
    await delay(200);
    const result = calculateReconciliation({
      openingBalance,
      deliveries,
      fuelIssues,
      actualClosing,
    });
    
    return {
      openingBalance,
      deliveries,
      fuelIssues,
      expectedClosing: result.expectedClosing,
      actualClosing,
      variance: result.variance,
      status: result.status,
    };
  },
  
  async getReconciliationSummary(): Promise<ReconciliationSummary> {
    await delay(200);
    const latest = mockReconciliationData[0];
    return {
      openingBalance: latest.openingBalance,
      deliveries: latest.deliveries,
      fuelIssues: latest.fuelIssues,
      expectedClosing: latest.expectedClosing,
      actualClosing: latest.actualClosing,
      variance: latest.variance,
      status: latest.status,
    };
  },
};