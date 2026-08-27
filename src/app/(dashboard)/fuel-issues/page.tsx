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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
    }, [router, page, selectedClient, startDate, endDate, selectedStatus]);

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
        setStartDate('');
        setEndDate('');
        setPage(1);
        loadData('', '', '', '', '');
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
            {/* Header section matching bootstrap layout exactly */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h4 className="font-bold text-zinc-900 text-lg leading-none m-0">Transactions</h4>
                    <span className="text-xs text-zinc-500 mt-0.5 inline-block">Track fuel dispensing and transactions</span>
                </div>
                <Button
                    onClick={() => loadData()}
                    className="bg-[#3c8e75] hover:bg-[#317561] text-white text-xs font-semibold rounded px-3 py-1.5 flex items-center gap-1 transition-colors duration-200 border-0 h-8 shadow-sm"
                >
                    <RefreshCw className="h-3.5 w-3.5 mr-0.5" />
                    Refresh
                </Button>
            </div>

            {/* Filters & Table Card wrapper */}
            <div className="bg-white border border-slate-200 shadow-sm rounded p-3 mb-4">
                {/* Filter bar container matching the bootstrap grid structure */}
                <div className="mb-3 py-2 px-3 bg-[#eefcf2] border border-[#d6f2e1] rounded w-full">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        {/* Search Input Group (col-md-4 equivalent) */}
                        <div className="md:col-span-4">
                            <div className="flex h-9">
                                <div className="relative flex-1 flex items-stretch">
                                    <span className="flex items-center px-3 border border-r-0 border-slate-200 bg-white rounded-l text-slate-400">
                                        <Search className="h-3.5 w-3.5" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search by ID, vehicle..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="flex-1 border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-9 rounded-none"
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    className="bg-[#f26522] hover:bg-[#d94f12] text-[11px] font-bold text-white px-4 rounded-r rounded-l-none h-9 border border-[#f26522] transition-colors duration-200 shrink-0"
                                >
                                    Search
                                </Button>
                            </div>
                        </div>

                        {/* FROM Date Selector (col-md-2 equivalent) */}
                        <div className="md:col-span-2 flex items-center h-9">
                            <div className="flex items-center gap-2 w-full">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">FROM:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="flex-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-9 shadow-xs"
                                />
                            </div>
                        </div>

                        {/* TO Date Selector (col-md-2 equivalent) */}
                        <div className="md:col-span-2 flex items-center h-9">
                            <div className="flex items-center gap-2 w-full">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">TO:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="flex-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-9 shadow-xs"
                                />
                            </div>
                        </div>

                        {/* DEM METHOD Dropdown Selector (col-md-3 equivalent) */}
                        <div className="md:col-span-3 flex items-center h-9">
                            <div className="flex items-center gap-2 w-full">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">DEM METHOD:</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="flex-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-9 cursor-pointer"
                                >
                                    <option value="">All methods</option>
                                    <option value="Matched">Matched</option>
                                    <option value="Unmatched">Unmatched</option>
                                    <option value="Exception">Exception</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons (col-md-1 equivalent) */}
                        <div className="md:col-span-1 flex items-center justify-end h-9">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-9 w-9 p-0 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0"
                                    title="Reset filters"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    onClick={() => {}}
                                    className="h-9 w-9 p-0 bg-[#f26522] hover:bg-[#d94f12] text-white rounded border border-[#f26522] transition-colors duration-200 shrink-0"
                                    title="Export fuel levels"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 shadow-xs rounded mb-4">
                    <table className="w-full text-sm border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="divide-x divide-white/10">
                                <th className="bg-primary text-white py-2 px-3 text-left font-semibold">Date / Time</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">ID</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Vehicle Req</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Fleet Id</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Vehicle Detail</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Site</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Litres</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Pump</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Odo Meter</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Hour Meter</th>
                                <th className="bg-[#222] text-white py-2 px-3 text-left font-semibold">DEM</th>
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
                                    <tr key={issue.id} className="border-b border-slate-100 last:border-0 odd:bg-white even:bg-[#fff9f5] hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2 px-3 text-slate-600 align-middle">{issue.date} {issue.time}</td>
                                        <td className="py-2 px-3 font-bold text-slate-900 align-middle">{issue.transactionId}</td>
                                        <td className="py-2 px-3 font-bold text-green-600 align-middle">{issue.vehicleId}</td>
                                        <td className="py-2 px-3 text-slate-600 align-middle">{issue.fleetId}</td>
                                        <td className="py-2 px-3 text-slate-600 align-middle">{issue.driverAttendant}</td>
                                        <td className="py-2 px-3 text-slate-600 align-middle">{issue.depot}</td>
                                        <td className="py-2 px-3 font-bold text-slate-900 align-middle">{formatFuel(issue.fuelQuantity)}</td>
                                        <td className="py-2 px-3 text-slate-600 align-middle">{issue.pump}</td>
                                        <td className="py-2 px-3 text-slate-600 align-middle">{issue.odometer}</td>
                                        <td className="py-2 px-3 text-slate-600 align-middle">{issue.engineHours}</td>
                                        <td className="py-2 px-3 align-middle">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                                issue.status === 'Matched'
                                                    ? 'bg-[#eefcf2] border-[#d6f2e1] text-[#138024]'
                                                    : 'bg-[#fff6f0] border-[#ffe3d1] text-[#f26522]'
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
            </div>
        </PageContainer>
    );
}
