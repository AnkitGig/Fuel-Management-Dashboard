// src/app/(dashboard)/fuel-issues/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { fuelIssueService } from '@/services/fuelIssueService';
import { vehicleService } from '@/services/vehicleService';
import { authService } from '@/lib/auth';
import { formatFuel } from '@/lib/utils';
import { useClientStore } from '@/services/api';

export default function FuelIssuesPage() {
    const router = useRouter();
    const selectedClient = useClientStore((state) => state.selectedClient);
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [startDate, setStartDate] = useState('2026-08-01');
    const [endDate, setEndDate] = useState('2026-08-19');

    const [vehicles, setVehicles] = useState<string[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Initial load and reload on page/client change
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
    }, [router, page, selectedClient]);

    const loadData = async (
        overrideSearch?: string,
        overrideStatus?: string,
        overrideVehicle?: string,
        overrideStart?: string,
        overrideEnd?: string
    ) => {
        try {
            setLoading(true);
            const response = await fuelIssueService.getFuelIssues({
                page,
                pageSize,
                search: overrideSearch !== undefined ? overrideSearch || undefined : search || undefined,
                status: overrideStatus !== undefined ? overrideStatus || undefined : selectedStatus || undefined,
                vehicleId: overrideVehicle !== undefined ? overrideVehicle || undefined : selectedVehicle || undefined,
                startDate: overrideStart !== undefined ? overrideStart : startDate,
                endDate: overrideEnd !== undefined ? overrideEnd : endDate,
            });
            setIssues(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to load transactions');
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

    const handleSearch = () => {
        setPage(1);
        loadData();
    };

    const handleReset = () => {
        setSearch('');
        setSelectedStatus('');
        setSelectedVehicle('');
        setStartDate('2026-08-01');
        setEndDate('2026-08-19');
        setPage(1);
        loadData('', '', '', '2026-08-01', '2026-08-19');
    };

    if (loading && issues.length === 0) {
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
                    <Button onClick={() => loadData()}>Try Again</Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">Track fuel dispensing and transactions</p>
                </div>
                <Button onClick={() => loadData()} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card className="rounded-none border border-slate-200 shadow-xs">
                <CardHeader className="pb-3 px-6">
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>Complete list of fuel transactions</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 flex-wrap items-center px-6">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by ID, vehicle..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full rounded-none border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        {/* Date Filters */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="rounded-none border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="rounded-none border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">All Statuses</option>
                            <option value="Matched">Matched</option>
                            <option value="Unmatched">Unmatched</option>
                            <option value="Exception">Exception</option>
                        </select>
                        <select
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                            className="rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">All Vehicles</option>
                            {vehicles.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <Button onClick={handleSearch} size="sm">Search</Button>
                            <Button onClick={handleReset} variant="outline" size="sm">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto border-y border-slate-200 shadow-xs">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-[#ff6600] text-white p-3 text-left font-semibold border-r border-white/25 whitespace-nowrap">Date / Time</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">ID</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25 whitespace-nowrap">Vehicle Req</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25 whitespace-nowrap">Fleet Id</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25 whitespace-nowrap">Vehicle Detail</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Site</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Litres</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Pump</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25 whitespace-nowrap">Odo Meter</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25 whitespace-nowrap">Hour Meter</th>
                                    <th className="bg-[#5a5a5a] text-white p-3 text-left font-semibold">DEM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="p-8 text-center text-slate-400 bg-slate-50">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    issues.map((issue) => (
                                        <tr key={issue.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="p-3 whitespace-nowrap text-slate-600 align-middle border-r border-slate-200">{issue.date} {issue.time}</td>
                                            <td className="p-3 font-semibold text-slate-800 align-middle border-r border-slate-200">{issue.transactionId}</td>
                                            <td className="p-3 font-semibold text-[#138024] align-middle border-r border-slate-200">{issue.vehicleId}</td>
                                            <td className="p-3 text-slate-600 align-middle border-r border-slate-200">{issue.fleetId}</td>
                                            <td className="p-3 text-slate-600 align-middle border-r border-slate-200">{issue.driverAttendant}</td>
                                            <td className="p-3 text-slate-600 align-middle border-r border-slate-200">{issue.depot}</td>
                                            <td className="p-3 font-bold text-slate-800 align-middle border-r border-slate-200">{formatFuel(issue.fuelQuantity)}</td>
                                            <td className="p-3 text-slate-600 align-middle border-r border-slate-200">{issue.pump}</td>
                                            <td className="p-3 text-slate-600 align-middle border-r border-slate-200">{issue.odometer}</td>
                                            <td className="p-3 text-slate-600 align-middle border-r border-slate-200">{issue.engineHours}</td>
                                            <td className="p-3 align-middle">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-xs border ${
                                                    issue.status === 'Matched' 
                                                        ? 'bg-green-50 border-green-200 text-green-700' 
                                                        : 'bg-amber-50 border-amber-200 text-amber-700'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full bg-current`} />
                                                    {issue.dem || issue.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 px-6">
                            <p className="text-sm text-muted-foreground">
                                Showing {issues.length} of {total} transactions
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 text-sm">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </PageContainer>
    );
}
