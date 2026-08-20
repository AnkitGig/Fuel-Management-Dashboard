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

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await deliveryService.getDeliveries({
                page,
                pageSize,
                search: search || undefined,
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Fuel Deliveries</h1>
                    <p className="text-slate-500 text-xs">Manage and track all fuel deliveries</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm" className="h-7 text-xs px-2.5">
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Refresh
                </Button>
            </div>

            <Card className="rounded-none border border-slate-200 shadow-xs">
                <CardHeader className="py-1.5 px-4 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-sm font-semibold text-slate-800">All Deliveries</CardTitle>
                        <CardDescription className="text-slate-500 text-[11px]">Complete list of fuel deliveries</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-2">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2 px-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full rounded-none border border-slate-300 bg-white pl-8 pr-3 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-xs"
                            />
                        </div>
                        <Button onClick={handleSearch} size="sm" className="h-7 text-xs px-3">Search</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Export
                        </Button>
                    </div>

                    <div className="overflow-x-auto border-y border-slate-200 shadow-xs">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Delivery ID</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Date</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Time</th>
                                    <th className="bg-[#555555] text-white py-2 px-3 text-left font-semibold last:border-r-0">Quantity</th>
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
                                        <tr key={delivery.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="py-2 px-3 font-semibold text-slate-800 align-middle border-r border-slate-200">{delivery.deliveryId}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{delivery.date}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{delivery.time}</td>
                                            <td className="py-2 px-3 font-bold text-slate-800 align-middle">{formatFuel(delivery.quantity)}</td>
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
                </CardContent>
            </Card>
        </PageContainer>
    );
}
