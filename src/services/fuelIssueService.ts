// src/services/fuelIssueService.ts
import { FuelIssue } from '@/types/fuel';
import { FilterParams, PaginatedResponse } from '@/types/common';
import { useClientStore, fmaApiRequest } from './api';

export const fuelIssueService = {
  async getFuelIssues(params: FilterParams = {}): Promise<PaginatedResponse<any>> {
    const client = useClientStore.getState().selectedClient;
    
    // Get start/end dates
    const datefrom = params.startDate || '2026-08-01';
    const dateto = params.endDate || '2026-08-19';

    const payload = {
      clientid: client.clientid, // Must be string
      userid: Number(client.userid),
      divisionid: Number(client.divisionid),
      datefrom,
      dateto
    };

    try {
      const response = await fmaApiRequest<any[]>('/api/fmacontrollertrans/GetTransactions', payload);
      
      let data = response.map((item: any) => {
        return {
          id: item.TransactionId.toString(),
          transactionId: item.TransactionId.toString(),
          date: item.Date,
          time: item.Time,
          vehicleId: item.RegistrationNo || '',
          fleetId: item.FleetId || '',
          driverAttendant: item.DriverAttendant || '',
          depot: item.Depot || '',
          dem: item.DEM || '',
          fuelQuantity: item.Quantity,
          pump: item.Pump || '',
          odometer: item.Odometer || 0,
          engineHours: item.EngineHours || 0,
          status: item.DEM && item.DEM.toLowerCase().includes('matched') ? 'Matched' : 'Unmatched',
          createdAt: `${item.Date}T${item.Time}Z`,
          updatedAt: `${item.Date}T${item.Time}Z`,
        };
      });

      // Apply search filters if present
      if (params.search) {
        const search = params.search.toLowerCase();
        data = data.filter(item => 
          item.transactionId.toLowerCase().includes(search) ||
          item.vehicleId.toLowerCase().includes(search) ||
          item.fleetId.toLowerCase().includes(search) ||
          item.driverAttendant.toLowerCase().includes(search) ||
          item.depot.toLowerCase().includes(search)
        );
      }

      if (params.vehicleId) {
        data = data.filter(item => item.vehicleId === params.vehicleId);
      }

      // Sort by date descending
      data.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

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
    } catch (err) {
      console.error(err);
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 0,
      };
    }
  },
  
  async getFuelIssueById(id: string): Promise<FuelIssue | null> {
    const res = await this.getFuelIssues({ page: 1, pageSize: 100 });
    return res.data.find((f: any) => f.id === id) || null;
  },
  
  async getUnmatchedIssues(): Promise<FuelIssue[]> {
    const res = await this.getFuelIssues({ page: 1, pageSize: 200 });
    return res.data.filter((f: any) => f.status === 'Unmatched' || f.status === 'Exception');
  },
};
