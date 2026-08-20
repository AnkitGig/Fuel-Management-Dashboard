// src/app/(dashboard)/vehicles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { vehicleService } from '@/services/vehicleService';
import { authService } from '@/lib/auth';
import { formatFuel, formatNumber } from '@/lib/utils';
import { Vehicle } from '@/types/vehicle';
import { useClientStore } from '@/services/api';

export default function VehiclesPage() {
    const router = useRouter();
    const selectedClient = useClientStore((state) => state.selectedClient);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [startDate, setStartDate] = useState('2026-08-01');
    const [endDate, setEndDate] = useState('2026-08-19');

    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await authService.isAuthenticated();
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            loadData();
        };
        checkAuth();
    }, [router, page, selectedClient]);

    const loadData = async (
        overrideSearch?: string,
        overrideStatus?: string,
        overrideStart?: string,
        overrideEnd?: string
    ) => {
        try {
            setLoading(true);
            const response = await vehicleService.getVehicles({
                page,
                pageSize,
                search: overrideSearch !== undefined ? overrideSearch || undefined : search || undefined,
                status: overrideStatus !== undefined ? overrideStatus || undefined : selectedStatus || undefined,
                startDate: overrideStart !== undefined ? overrideStart : startDate,
                endDate: overrideEnd !== undefined ? overrideEnd : endDate,
            });
            setVehicles(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadData();
    };

    const handleReset = () => {
        setSearch('');
        setSelectedStatus('');
        setStartDate('2026-08-01');
        setEndDate('2026-08-19');
        setPage(1);
        loadData('', '', '2026-08-01', '2026-08-19');
    };

    if (loading && vehicles.length === 0) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Fuel Efficiency</h1>
                    <p className="text-muted-foreground">Monitor fleet vehicle fuel efficiency metrics</p>
                </div>
                <Button onClick={() => loadData()} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card className="rounded-none border border-slate-200 shadow-xs">
                <CardHeader className="pb-3 px-6">
                    <CardTitle>All Vehicles</CardTitle>
                    <CardDescription>Complete list of fleet vehicles and efficiency</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 flex-wrap items-center px-6">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by ID, type, or asset type..."
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
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
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
                                    <th className="bg-[#02172e] text-white py-2 px-3 text-left font-semibold border-r border-[#00c0b5]/15 last:border-r-0">Vehicle ID</th>
                                    <th className="bg-[#02172e] text-white py-2 px-3 text-left font-semibold border-r border-[#00c0b5]/15 last:border-r-0">Vehicle Type</th>
                                    <th className="bg-[#02172e] text-white py-2 px-3 text-left font-semibold border-r border-[#00c0b5]/15 last:border-r-0">Asset Type</th>
                                    <th className="bg-[#02172e] text-white py-2 px-3 text-left font-semibold border-r border-[#00c0b5]/15 last:border-r-0">Odometer</th>
                                    <th className="bg-[#02172e] text-white py-2 px-3 text-left font-semibold border-r border-[#00c0b5]/15 last:border-r-0">Distance</th>
                                    <th className="bg-[#02172e] text-white py-2 px-3 text-left font-semibold border-r border-[#00c0b5]/15 last:border-r-0">Fuel Issued</th>
                                    <th className="bg-[#02172e] text-white py-2 px-3 text-left font-semibold border-r border-[#00c0b5]/15 last:border-r-0">Consumption</th>
                                    <th className="bg-[#02172e] text-white py-2 px-3 text-left font-semibold last:border-r-0">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-400 bg-slate-50">
                                            No vehicles found
                                        </td>
                                    </tr>
                                ) : (
                                    vehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="py-2 px-3 font-semibold text-slate-800 align-middle border-r border-slate-200">{vehicle.vehicleId}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{vehicle.vehicleType}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{vehicle.assetType}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{formatNumber(vehicle.odometer)}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{formatNumber(vehicle.distanceTraveled)} km</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{formatFuel(vehicle.fuelIssued)}</td>
                                            <td className="py-2 px-3 font-medium text-slate-800 align-middle border-r border-slate-200">{vehicle.fuelConsumption.toFixed(1)} L/100km</td>
                                            <td className="py-2 px-3 align-middle">
                                                <StatusBadge status={vehicle.status} />
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
                            <p className="text-sm text-slate-500">
                                Showing {vehicles.length} of {total} vehicles
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
                                <span className="flex items-center px-3 text-sm text-slate-600 font-medium">
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
