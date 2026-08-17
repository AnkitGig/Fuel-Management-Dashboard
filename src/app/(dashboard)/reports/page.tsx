// src/app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Download,
    FileText,
    Truck,
    ClipboardList,
    AlertTriangle,
    RefreshCw,
    FileBarChart,
    Printer,
    FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { reportService } from '@/services/reportService';
import { vehicleService } from '@/services/vehicleService';
import { authService } from '@/lib/auth';
import { formatDate, formatDateTime, formatFuel, getStatusColor } from '@/lib/utils';
import { Report } from '@/types/report';

const reportTypes = [
    { value: 'fuel-transaction', label: 'Fuel Transaction Report' },
    { value: 'fuel-consumption', label: 'Fuel Consumption Report' },
    { value: 'delivery', label: 'Delivery Report' },
    { value: 'reconciliation', label: 'Reconciliation Report' },
    { value: 'vehicle', label: 'Vehicle/Asset Report' },
];

export default function ReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [vehicles, setVehicles] = useState<string[]>([]);

    // Report form state
    const [reportType, setReportType] = useState('fuel-transaction');
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedVehicle, setSelectedVehicle] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await authService.isAuthenticated();
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            loadData();
            loadVehicles();
        };
        checkAuth();
    }, [router]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Generate some mock reports
            const mockReports: Report[] = [
                {
                    id: '1',
                    reportId: 'RPT-001',
                    title: 'Fuel Transaction Report',
                    type: 'fuel-transaction',
                    dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
                    generatedBy: 'Admin User',
                    status: 'Completed',
                    createdAt: '2026-08-01T10:00:00Z',
                    updatedAt: '2026-08-01T10:00:00Z',
                },
                {
                    id: '2',
                    reportId: 'RPT-002',
                    title: 'Reconciliation Report',
                    type: 'reconciliation',
                    dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
                    generatedBy: 'Admin User',
                    status: 'Completed',
                    createdAt: '2026-08-02T14:30:00Z',
                    updatedAt: '2026-08-02T14:30:00Z',
                },
                {
                    id: '3',
                    reportId: 'RPT-003',
                    title: 'Vehicle Report',
                    type: 'vehicle',
                    dateRange: { startDate: '2026-07-01', endDate: '2026-07-31' },
                    generatedBy: 'Manager User',
                    status: 'Generating',
                    createdAt: '2026-08-03T09:15:00Z',
                    updatedAt: '2026-08-03T09:15:00Z',
                },
            ];
            setReports(mockReports);
            setError(null);
        } catch (err) {
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const loadVehicles = async () => {
        try {
            const response = await vehicleService.getVehicles({ pageSize: 100 });
            setVehicles(response.data.map(v => v.vehicleId));
        } catch {
            // Ignore
        }
    };

    const handleGenerateReport = async () => {
        try {
            setGenerating(true);
            await reportService.generateReport({
                reportType,
                startDate,
                endDate,
                vehicleId: selectedVehicle || undefined,
            });
            await loadData();
        } catch {
            setError('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <p className="text-lg text-muted-foreground">{error}</p>
                    <Button onClick={loadData}>Try Again</Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Report Centre</h1>
                    <p className="text-muted-foreground">Generate and manage reports</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Generate Report Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Generate New Report</CardTitle>
                    <CardDescription>Select parameters to generate a report</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="text-sm font-medium">Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {reportTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Vehicle (Optional)</label>
                            <select
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">All Vehicles</option>
                                {vehicles.map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={handleGenerateReport} disabled={generating}>
                            {generating ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Report
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            <Card>
                <CardHeader>
                    <CardTitle>Generated Reports</CardTitle>
                    <CardDescription>Previously generated reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium">Report ID</th>
                                    <th className="text-left p-3 font-medium">Title</th>
                                    <th className="text-left p-3 font-medium">Type</th>
                                    <th className="text-left p-3 font-medium">Date Range</th>
                                    <th className="text-left p-3 font-medium">Generated By</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                            No reports found
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr key={report.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 font-medium">{report.reportId}</td>
                                            <td className="p-3">{report.title}</td>
                                            <td className="p-3">
                                                {reportTypes.find(t => t.value === report.type)?.label || report.type}
                                            </td>
                                            <td className="p-3">
                                                {formatDate(report.dateRange.startDate)} - {formatDate(report.dateRange.endDate)}
                                            </td>
                                            <td className="p-3">{report.generatedBy}</td>
                                            <td className="p-3">
                                                <StatusBadge status={report.status} />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" disabled={report.status !== 'Completed'}>
                                                        <FileBarChart className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" disabled={report.status !== 'Completed'}>
                                                        <FileSpreadsheet className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" disabled={report.status !== 'Completed'}>
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" disabled={report.status !== 'Completed'}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </PageContainer>
    );
}