// src/services/vehicleService.ts
import { mockVehicles } from '@/data/vehicles';
import { Vehicle, VehicleFuelUsage } from '@/types/vehicle';
import { FilterParams, PaginatedResponse } from '@/types/common';
import { delay } from '@/lib/utils';

// TODO: Replace with real Vehicle/Asset API

export const vehicleService = {
  async getVehicles(params: FilterParams = {}): Promise<PaginatedResponse<Vehicle>> {
    await delay(300);
    
    let data = [...mockVehicles];
    
    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      data = data.filter(item => 
        item.vehicleId.toLowerCase().includes(search) ||
        item.vehicleType.toLowerCase().includes(search) ||
        item.assetType.toLowerCase().includes(search)
      );
    }
    if (params.status) {
      data = data.filter(item => item.status === params.status);
    }
    
    // Sort by vehicleId
    data.sort((a, b) => a.vehicleId.localeCompare(b.vehicleId));
    
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
  
  async getVehicleById(id: string): Promise<Vehicle | null> {
    await delay(200);
    return mockVehicles.find(v => v.id === id) || null;
  },
  
  async getVehicleFuelUsage(vehicleId: string): Promise<VehicleFuelUsage[]> {
    await delay(200);
    // Mock fuel usage data
    const usage: VehicleFuelUsage[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      usage.push({
        vehicleId,
        date: date.toISOString().split('T')[0],
        fuelConsumed: Math.floor(Math.random() * 40) + 20,
        distanceTraveled: Math.floor(Math.random() * 200) + 100,
        efficiency: parseFloat((Math.random() * 5 + 5).toFixed(1)),
      });
    }
    
    return usage;
  },
};