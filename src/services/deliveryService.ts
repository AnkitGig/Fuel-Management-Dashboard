// src/services/deliveryService.ts
import { mockDeliveries } from '@/data/deliveries';
import { FuelDelivery } from '@/types/fuel';
import { FilterParams, PaginatedResponse } from '@/types/common';
import { delay } from '@/lib/utils';

// TODO: Replace with real Fuel Management API

export const deliveryService = {
  async getDeliveries(params: FilterParams = {}): Promise<PaginatedResponse<FuelDelivery>> {
    await delay(300);
    
    let data = [...mockDeliveries];
    
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
        item.deliveryId.toLowerCase().includes(search) ||
        item.supplier.toLowerCase().includes(search) ||
        item.status.toLowerCase().includes(search)
      );
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
  
  async getDeliveryById(id: string): Promise<FuelDelivery | null> {
    await delay(200);
    return mockDeliveries.find(d => d.id === id) || null;
  },
};