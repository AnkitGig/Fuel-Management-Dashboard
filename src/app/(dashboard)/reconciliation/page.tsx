// src/app/(dashboard)/reconciliation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { reconciliationService } from '@/services/reconciliationService';
import { authService } from '@/lib/auth';
import { formatFuel, formatNumber } from '@/lib/utils';
import { Reconciliation } from '@/types/reconciliation';
import { useClientStore } from '@/services/api';

export default function ReconciliationPage() {
    const router = useRouter();
    const selectedClient = useClientStore((state) => state.selectedClient);
    const [records, setRecords] = useState<Reconciliation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Date range filters
    const [startDate, setStartDate] = useState('2026-08-01');
    const [endDate, setEndDate] = useState('2026-08-19');

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
            const response = await reconciliationService.getReconciliationRecords({
                page,
                pageSize,
                status: selectedStatus || undefined,
                startDate,
                endDate,
            });
            setRecords(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to load reconciliation records');
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic values for top summary tables
    const summaryData = (() => {
        if (records.length === 0) return null;

        // Cumulative sum for the selected range
        const totalDeliveries = records.reduce((sum, r) => sum + r.deliveries, 0);
        const totalIssues = records.reduce((sum, r) => sum + r.fuelIssues, 0);

        // Sorting chronologically to get opening/closing
        const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const openingDip = sorted[0]?.openingBalance || 0;
        const closingDip = sorted[sorted.length - 1]?.actualClosing || 0;
        const closingStock = openingDip + totalDeliveries - totalIssues; // Expected
        const variance = closingDip - closingStock;
        const variancePercent = closingStock > 0 ? (variance / closingStock) * 100 : 0;

        // Stock Demand Plan Calculations
        const avDailyCons = records.length > 0 ? totalIssues / records.length : 0;
        const daysStock = avDailyCons > 0 ? Math.round(closingDip / avDailyCons) : 0;

        // Order Date calculations
        const today = new Date();
        const reorderDays = 7;
        const minStock = 3000;

        const reorderDate = new Date(today);
        reorderDate.setDate(today.getDate() + Math.max(0, daysStock - reorderDays));

        const arrivalDate = new Date(today);
        arrivalDate.setDate(today.getDate() + daysStock);

        const formatDateStr = (date: Date) => {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear().toString().slice(-2)}`;
        };

        return {
            openingDip,
            totalIssues,
            totalDeliveries,
            closingDip,
            closingStock,
            variance,
            variancePercent,
            avDailyCons,
            daysStock,
            minStock,
            reorderDays,
            reorderDate: formatDateStr(reorderDate),
            arrivalDate: formatDateStr(arrivalDate)
        };
    })();

    const filteredRecords = records.filter(record =>
        selectedStatus ? record.status === selectedStatus : true
    );

    if (loading && records.length === 0) {
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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Reconciliation</h1>
                    <p className="text-muted-foreground">Daily fuel reconciliation and variance tracking</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Dynamic Summary Cards */}
            {summaryData && (
                <div className="grid gap-6 md:grid-cols-12 items-start">
                    {/* Stock Reconciliation Summary (Span 4) */}
                    <div className="md:col-span-4 border border-black/25 rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-[#00c0b5] py-2 px-3 text-center border-b border-black/25">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Stock Reconciliation Summary</span>
                        </div>
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Opening Dip</td>
                                    <td className="p-2 text-right text-slate-900">{formatNumber(summaryData.openingDip)}</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Fuel Issues</td>
                                    <td className="p-2 text-right text-slate-900">{formatNumber(summaryData.totalIssues)}</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Fuel Receipts</td>
                                    <td className="p-2 text-right text-slate-900">{formatNumber(summaryData.totalDeliveries)}</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Closing Dip</td>
                                    <td className="p-2 text-right text-slate-900">{formatNumber(summaryData.closingDip)}</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Closing Stock</td>
                                    <td className="p-2 text-right text-slate-900">{formatNumber(summaryData.closingStock)}</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Variance</td>
                                    <td className="p-2 text-right text-slate-900 font-bold">{formatNumber(Number(summaryData.variance.toFixed(2)))}</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">%</td>
                                    <td className="p-2 text-right text-slate-900 font-bold">{summaryData.variancePercent.toFixed(1)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Stock Demand Plan (Span 8) */}
                    <div className="md:col-span-8 border border-black/25 rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-[#00c0b5] py-2 px-3 text-center border-b border-black/25">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Stock Demand Plan</span>
                        </div>
                        <table className="w-full text-xs border-collapse">
                            <tbody>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20 w-1/4">Stock</td>
                                    <td className="p-2 text-center text-slate-900 border-r border-black/20 w-1/5">{formatNumber(summaryData.closingDip)}</td>
                                    <td className="p-2 text-slate-700">Balance remaining in the Tank.</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Av Daily Cons.</td>
                                    <td className="p-2 text-center text-slate-900 border-r border-black/20">{formatNumber(Math.round(summaryData.avDailyCons))}</td>
                                    <td className="p-2 text-slate-700">Average Fuel Consumption/Day MTD.</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Days Stock</td>
                                    <td className="p-2 text-center text-slate-900 border-r border-black/20">{summaryData.daysStock}</td>
                                    <td className="p-2 text-slate-700">Days left before Stock run Out based on Rated Use.</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Min Stock</td>
                                    <td className="p-2 text-center text-slate-900 border-r border-black/20">{formatNumber(summaryData.minStock)}</td>
                                    <td className="p-2 text-slate-700">Critical Tank Level for Main Tank.</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Re-Order</td>
                                    <td className="p-2 text-center text-slate-900 border-r border-black/20">{summaryData.reorderDays}</td>
                                    <td className="p-2 text-slate-700">Days to prepare for New Purchase.</td>
                                </tr>
                                <tr className="border-b border-black/20 bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Re-Order</td>
                                    <td className="p-2 text-center text-slate-900 border-r border-black/20 font-semibold text-amber-600">{summaryData.reorderDate}</td>
                                    <td className="p-2 text-slate-700">Placing Of order Date</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="p-2 font-bold text-slate-900 border-r border-black/20">Stock Arrival</td>
                                    <td className="p-2 text-center text-slate-900 border-r border-black/20 font-semibold text-emerald-600">{summaryData.arrivalDate}</td>
                                    <td className="p-2 text-slate-700">Delivery of stock Date</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Historical Records */}
            <Card className="rounded-none border border-slate-200 shadow-xs">
                <CardHeader className="pb-3 px-6">
                    <CardTitle>Historical Reconciliation</CardTitle>
                    <CardDescription>Daily reconciliation records and variance percentages</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center flex-wrap px-6">
                        {/* Date Range Selection */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-none border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-none border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-auto"
                        >
                            <option value="">All Statuses</option>
                            <option value="Reconciled">Reconciled</option>
                            <option value="Warning">Warning</option>
                            <option value="Exception">Exception</option>
                        </select>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>

                    <div className="overflow-x-auto border-y border-slate-200 shadow-xs">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-[#ff6600] text-white p-3 text-left font-semibold border-r border-white/25">Date</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Opening Balance</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Deliveries</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Fuel Issues</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Expected Closing</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Actual Closing</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Variance</th>
                                    <th className="bg-[#138024] text-white p-3 text-left font-semibold border-r border-white/25">Variance %</th>
                                    <th className="bg-[#5a5a5a] text-white p-3 text-left font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-slate-400 bg-slate-50">
                                            No reconciliation records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => {
                                        const vPercent = record.expectedClosing > 0 ? (record.variance / record.expectedClosing) * 100 : 0;
                                        return (
                                            <tr key={record.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                                                <td className="p-3 font-semibold text-slate-850 align-middle border-r border-slate-200">{record.date}</td>
                                                <td className="p-3 text-slate-600 align-middle border-r border-slate-200">{formatFuel(record.openingBalance)}</td>
                                                <td className="p-3 text-green-600 align-middle border-r border-slate-200">+{formatFuel(record.deliveries)}</td>
                                                <td className="p-3 text-red-600 align-middle border-r border-slate-200">-{formatFuel(record.fuelIssues)}</td>
                                                <td className="p-3 text-slate-600 align-middle border-r border-slate-200">{formatFuel(record.expectedClosing)}</td>
                                                <td className="p-3 text-slate-600 align-middle border-r border-slate-200">{formatFuel(record.actualClosing)}</td>
                                                <td className={`p-3 font-bold align-middle border-r border-slate-200 ${record.variance >= 0 ? 'text-green-600' : 'text-red-650'}`}>
                                                    {record.variance >= 0 ? '+' : ''}{formatFuel(record.variance)}
                                                </td>
                                                <td className={`p-3 font-bold align-middle border-r border-slate-200 ${vPercent >= 0 ? 'text-green-600' : 'text-red-650'}`}>
                                                    {vPercent >= 0 ? '+' : ''}{vPercent.toFixed(1)}%
                                                </td>
                                                <td className="p-3 align-middle">
                                                    <StatusBadge status={record.status} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 px-6">
                            <p className="text-sm text-muted-foreground">
                                Showing {filteredRecords.length} of {total} records
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
