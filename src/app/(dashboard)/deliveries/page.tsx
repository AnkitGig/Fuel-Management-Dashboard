// src/app/(dashboard)/deliveries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { deliveryService } from '@/services/deliveryService';
import { authService } from '@/lib/auth';
import { formatDate, formatFuel } from '@/lib/utils';
import { FuelDelivery } from '@/types/fuel';
import { useClientStore } from '@/services/api';

export default function DeliveriesPage() {
    const router = useRouter();
    const selectedClient = useClientStore((state) => state.selectedClient);
    const [deliveries, setDeliveries] = useState<FuelDelivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
    }, [router, page, selectedClient, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await deliveryService.getDeliveries({
                page,
                pageSize,
                search: search || undefined,
                startDate,
                endDate,
            });
            setDeliveries(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to load deliveries');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadData();
    };

    if (loading && deliveries.length === 0) {
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
            {/* Header section matching bootstrap layout exactly */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h4 className="font-bold text-zinc-900 text-lg leading-none m-0">Fuel Deliveries</h4>
                    <span className="text-xs text-zinc-500 mt-0.5 inline-block">Manage and track all fuel deliveries</span>
                </div>
                <Button
                    onClick={loadData}
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
                        {/* Search Input Group (col-md-5 equivalent) */}
                        <div className="md:col-span-5">
                            <div className="flex h-9">
                                <div className="relative flex-1 flex items-stretch">
                                    <span className="flex items-center px-3 border border-r-0 border-slate-200 bg-white rounded-l text-slate-400">
                                        <Search className="h-3.5 w-3.5" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search by ID..."
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

                        {/* FROM Date Selector (col-md-3 equivalent) */}
                        <div className="md:col-span-3 flex items-center h-9">
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

                        {/* TO Date Selector (col-md-3 equivalent) */}
                        <div className="md:col-span-3 flex items-center h-9">
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

                        {/* Action Buttons (col-md-1 equivalent) */}
                        <div className="md:col-span-1 flex items-center justify-end h-9">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadData}
                                    className="h-9 w-9 p-0 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    onClick={() => { }}
                                    className="h-9 w-9 p-0 bg-[#f26522] hover:bg-[#d94f12] text-white rounded border border-[#f26522] transition-colors duration-200 shrink-0"
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
                                <th className="bg-primary text-white py-2 px-3 text-left font-semibold">Delivery ID</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Date</th>
                                <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Time</th>
                                <th className="bg-[#222] text-white py-2 px-3 text-left font-semibold">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 bg-slate-50">
                                        No deliveries found
                                    </td>
                                </tr>
                            ) : (
                                deliveries.map((delivery) => (
                                    <tr key={delivery.id} className="border-b border-slate-100 last:border-0 odd:bg-white even:bg-[#fff9f5] hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2 px-3 font-bold text-slate-900 align-middle">{delivery.deliveryId}</td>
                                        <td className="py-2 px-3 text-slate-600 align-middle">{delivery.date}</td>
                                        <td className="py-2 px-3 text-slate-600 align-middle">{delivery.time}</td>
                                        <td className="py-2 px-3 font-bold text-slate-900 align-middle">{formatFuel(delivery.quantity)}</td>
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
                            Showing {deliveries.length} of {total} deliveries
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
