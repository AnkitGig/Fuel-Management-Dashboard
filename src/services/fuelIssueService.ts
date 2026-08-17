// src/services/fuelIssueService.ts
import { mockFuelIssues } from '@/data/fuelIssues';
import { FuelIssue } from '@/types/fuel';
import { FilterParams, PaginatedResponse } from '@/types/common';
import { delay } from '@/lib/utils';

// TODO: Replace with real Fuel Management API

export const fuelIssueService = {
  async getFuelIssues(params: FilterParams = {}): Promise<PaginatedResponse<FuelIssue>> {
    await delay(300);
    
    let data = [...mockFuelIssues];
    
    // Apply filters
    if (params.startDate) {
      data = data.filter(item => item.date >= params.startDate!);
    }
    if (params.endDate) {
      data = data.filter(item => item.date <= params.endDate!);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      data = data.filter(item => 
        item.transactionId.toLowerCase().includes(search) ||
        item.vehicleId.toLowerCase().includes(search) ||
        item.assetType.toLowerCase().includes(search)
      );
    }
    if (params.vehicleId) {
      data = data.filter(item => item.vehicleId === params.vehicleId);
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
  
  async getFuelIssueById(id: string): Promise<FuelIssue | null> {
    await delay(200);
    return mockFuelIssues.find(f => f.id === id) || null;
  },
  
  async getUnmatchedIssues(): Promise<FuelIssue[]> {
    await delay(200);
    return mockFuelIssues.filter(f => f.status === 'Unmatched' || f.status === 'Exception');
  },
};