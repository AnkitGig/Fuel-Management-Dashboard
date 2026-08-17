// src/services/reportService.ts
import { mockDeliveries } from '@/data/deliveries';
import { mockFuelIssues } from '@/data/fuelIssues';
import { mockVehicles } from '@/data/vehicles';
import { mockReconciliationData } from '@/data/reconciliation';
import { Report, ReportFilter } from '@/types/report';
import { delay, generateId } from '@/lib/utils';

// TODO: Replace with real Fuel Management API

export const reportService = {
  async generateReport(filter: ReportFilter): Promise<Report> {
    await delay(500);
    
    const report: Report = {
      id: generateId(),
      reportId: `RPT-${Date.now()}`,
      title: `${filter.reportType} Report`,
      type: filter.reportType as any,
      dateRange: {
        startDate: filter.startDate,
        endDate: filter.endDate,
      },
      generatedBy: 'current-user', // Would come from auth
      status: 'Completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return report;
  },
  
  async getReportData(filter: ReportFilter): Promise<any> {
    await delay(300);
    
    switch (filter.reportType) {
      case 'fuel-transaction':
        return mockFuelIssues.filter(f => 
          f.date >= filter.startDate && f.date <= filter.endDate
        );
      case 'fuel-consumption':
        return mockVehicles;
      case 'delivery':
        return mockDeliveries.filter(d => 
          d.date >= filter.startDate && d.date <= filter.endDate
        );
      case 'reconciliation':
        return mockReconciliationData.filter(r => 
          r.date >= filter.startDate && r.date <= filter.endDate
        );
      case 'vehicle':
        return mockVehicles;
      default:
        return [];
    }
  },
  
  async exportReport(reportId: string, format: 'csv' | 'xlsx'): Promise<Blob> {
    await delay(500);
    // Mock export - returns a simple text blob
    return new Blob(['Mock report data'], { type: 'text/plain' });
  },
};