// src/app/(dashboard)/vehicles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, AlertTriangle, RefreshCw, RotateCcw, Sliders } from 'lucide-react';
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

import { CustomTable } from '@/components/ui/table';

export default function VehiclesPage() {
    const router = useRouter();
    const selectedClient = useClientStore((state) => state.selectedClient);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const columns = [
        {
            key: "vehicleId",
            header: "Vehicle ID",
            headerClassName: "bg-[#f26522] text-white",
            cellClassName: "py-2 px-3 font-semibold text-slate-800 align-middle",
        },
        {
            key: "vehicleType",
            header: "Vehicle Type",
            headerClassName: "bg-[#137e19] text-white",
            cellClassName: "py-2 px-3 text-slate-600 align-middle",
        },
        {
            key: "assetType",
            header: "Asset Type",
            headerClassName: "bg-[#137e19] text-white",
            cellClassName: "py-2 px-3 text-slate-600 align-middle",
        },
        {
            key: "odometer",
            header: "Odometer",
            headerClassName: "bg-[#137e19] text-white",
            cellClassName: "py-2 px-3 text-slate-600 align-middle",
            render: (vehicle: Vehicle) => formatNumber(vehicle.odometer),
        },
        {
            key: "distanceTraveled",
            header: "Distance",
            headerClassName: "bg-[#137e19] text-white",
            cellClassName: "py-2 px-3 text-slate-600 align-middle",
            render: (vehicle: Vehicle) => `${formatNumber(vehicle.distanceTraveled)} km`,
        },
        {
            key: "fuelIssued",
            header: "Fuel Issued",
            headerClassName: "bg-[#137e19] text-white",
            cellClassName: "py-2 px-3 text-slate-600 align-middle",
            render: (vehicle: Vehicle) => formatFuel(vehicle.fuelIssued),
        },
        {
            key: "fuelConsumption",
            header: "Consumption",
            headerClassName: "bg-[#137e19] text-white",
            cellClassName: "py-2 px-3 font-medium text-slate-800 align-middle",
            render: (vehicle: Vehicle) => `${vehicle.fuelConsumption.toFixed(1)} L/100km`,
        },
        {
            key: "status",
            header: "Status",
            headerClassName: "bg-[#555555] text-white",
            cellClassName: "py-2 px-3 align-middle",
            render: (vehicle: Vehicle) => <StatusBadge status={vehicle.status} />,
        },
    ];

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
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="font-semibold text-zinc-900 text-2xl leading-tight m-0">Fuel Efficiency</h2>
                    <span className="text-sm text-zinc-500 mt-1 inline-block">Monitor fleet vehicle fuel efficiency metrics</span>
                </div>
                <Button
                    onClick={() => loadData()}
                    className="bg-[#3c8e75] hover:bg-[#317561] text-sm font-semibold rounded px-4 py-2 flex items-center gap-1.5 transition-colors duration-200 border-0 h-10 shadow-sm"
                >
                    <RefreshCw className="h-4 w-4 mr-0.5" />
                    Refresh
                </Button>
            </div>

            <Card className="rounded border border-slate-200 shadow-sm p-4 mb-4">
                <CardContent className="p-0">
                    {/* Filter bar container matching the bootstrap grid structure */}
                    <div className="mb-4 py-2.5 px-4 bg-[#eefcf2] border border-[#d6f2e1] rounded w-full">
                        <div className="grid grid-cols-12 gap-2 items-end">
                            {/* Search Input Group */}
                            <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Search vehicles </label>
                                <div className="flex h-8">
                                    <span className="flex items-center px-3 border border-r-0 border-slate-200 bg-slate-50 rounded-l text-slate-400">
                                        <Search className="h-3 w-3" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search by ID, type, or asset type..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="flex-1 border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-8 rounded-r rounded-l-none"
                                    />
                                </div>
                            </div>

                            {/* FROM Date Selector */}
                            <div className="col-span-12 md:col-span-3 lg:col-span-2 xl:col-span-2 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">From date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="rounded border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-8 shadow-xs w-full"
                                />
                            </div>

                            {/* TO Date Selector */}
                            <div className="col-span-12 md:col-span-3 lg:col-span-2 xl:col-span-2 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">To date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="rounded border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-8 shadow-xs w-full"
                                />
                            </div>

                            {/* DEM METHOD Dropdown Selector */}
                            <div className="col-span-12 md:col-span-3 lg:col-span-2 xl:col-span-2 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="rounded border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-8 cursor-pointer w-full"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 flex gap-2 justify-start xl:justify-end h-8">
                                <Button
                                    onClick={handleSearch}
                                    className="bg-[#f26522] hover:bg-[#d94f12] text-xs font-semibold text-white px-4 rounded h-8 border border-[#f26522] transition-colors duration-200 flex items-center justify-center gap-1.5"
                                >
                                    <Sliders className="h-3.5 w-3.5" />
                                    Search
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-8 px-4 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
                                    title="Reset filters"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Reset
                                </Button>
                                <Button
                                    onClick={() => { }}
                                    className="bg-[#f26522] hover:bg-[#d94f12] text-white text-xs font-semibold rounded h-8 px-4 border border-[#f26522] transition-colors duration-200 flex items-center justify-center gap-1.5"
                                    title="Export fuel levels"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>

                    <CustomTable
                        data={vehicles}
                        columns={columns}
                        keyExtractor={(v) => v.id}
                        emptyStateText="No vehicles found"
                        rowClassName="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors odd:bg-white even:bg-[#fff9f5]"
                    />

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
