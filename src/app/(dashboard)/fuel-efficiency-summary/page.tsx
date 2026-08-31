// src/app/(dashboard)/fuel-efficiency-summary/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, AlertTriangle, RefreshCw, RotateCcw, Sliders } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { fuelIssueService } from '@/services/fuelIssueService';
import { authService } from '@/lib/auth';
import { formatFuel, formatNumber } from '@/lib/utils';
import { useClientStore } from '@/services/api';

interface VehicleEfficiency {
    description: string;
    ltrs: number;
    transactions: number;
    distance: number;
    kmPerLtr: number;
    ltrsPer100Km: number;
}

export default function FuelEfficiencySummaryPage() {
    const router = useRouter();
    const selectedClient = useClientStore((state) => state.selectedClient);
    const [data, setData] = useState<VehicleEfficiency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

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
    }, [router, selectedClient]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fuelIssueService.getFuelIssues({
                page: 1,
                pageSize: 2000, // Load all transactions to group
            });

            if (!response.data || response.data.length === 0) {
                setData([]);
                setError(null);
                return;
            }

            // Group transactions by RegistrationNo / vehicleId
            const groups: Record<string, { ltrs: number; txCount: number; maxOdo: number; minOdo: number }> = {};

            response.data.forEach((tx: any) => {
                const vehicle = tx.vehicleId || 'Unknown';
                if (!groups[vehicle]) {
                    groups[vehicle] = {
                        ltrs: 0,
                        txCount: 0,
                        maxOdo: 0,
                        minOdo: Infinity
                    };
                }

                groups[vehicle].ltrs += tx.fuelQuantity || 0;
                groups[vehicle].txCount += 1;

                const odo = Number(tx.odometer);
                if (odo > 0) {
                    if (odo > groups[vehicle].maxOdo) groups[vehicle].maxOdo = odo;
                    if (odo < groups[vehicle].minOdo) groups[vehicle].minOdo = odo;
                }
            });

            const computed: VehicleEfficiency[] = Object.keys(groups).map(vehicle => {
                const g = groups[vehicle];
                const distance = g.minOdo !== Infinity && g.maxOdo > g.minOdo ? g.maxOdo - g.minOdo : 0;
                const kmPerLtr = distance > 0 && g.ltrs > 0 ? Number((distance / g.ltrs).toFixed(2)) : 0;
                const ltrsPer100Km = distance > 0 && g.ltrs > 0 ? Number(((g.ltrs / distance) * 100).toFixed(1)) : 0;

                return {
                    description: vehicle,
                    ltrs: Number(g.ltrs.toFixed(2)),
                    transactions: g.txCount,
                    distance: distance,
                    kmPerLtr,
                    ltrsPer100Km
                };
            });

            // Sort by Ltrs descending
            computed.sort((a, b) => b.ltrs - a.ltrs);
            setData(computed);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to compute fuel efficiency metrics from live data.');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter(item =>
        item.description.toLowerCase().includes(search.toLowerCase())
    );

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
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="font-semibold text-zinc-900 text-2xl leading-tight m-0">Fuel Efficiency Summary</h2>
                    <span className="text-sm text-zinc-500 mt-1 inline-block">Detailed view of vehicle fuel burn rates and usage (Calculated from Live API)</span>
                </div>
                <Button
                    onClick={loadData}
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
                            <div className="col-span-12 md:col-span-8 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Search vehicles</label>
                                <div className="flex h-8">
                                    <span className="flex items-center px-3 border border-r-0 border-slate-200 bg-slate-50 rounded-l text-slate-400">
                                        <Search className="h-3 w-3" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search by vehicle..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="flex-1 border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-8 rounded-r rounded-l-none"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="col-span-12 md:col-span-4 flex gap-2 justify-start md:justify-end h-8">
                                <Button
                                    onClick={() => { }}
                                    className="bg-[#f26522] hover:bg-[#d94f12] text-xs font-semibold text-white px-4 rounded h-8 border border-[#f26522] transition-colors duration-200 flex items-center justify-center gap-1.5"
                                >
                                    <Sliders className="h-3.5 w-3.5" />
                                    Search
                                </Button>
                                <Button
                                    onClick={() => { }}
                                    className="bg-[#f26522] hover:bg-[#d94f12] text-white text-xs font-semibold rounded h-8 px-4 border border-[#f26522] transition-colors duration-200 flex items-center justify-center gap-1.5"
                                    title="Export"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 shadow-xs rounded mb-4">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-[#f26522] text-white py-2 px-3 text-left font-semibold">Vehicle Description</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Ltrs</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">No. of Transactions</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Distance (KM)</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Fuel Burn (Km/L)</th>
                                    <th className="bg-[#555555] text-white py-2 px-3 text-left font-semibold">Fuel Burn (L/100Km)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400 bg-slate-50">
                                            No vehicle data found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors odd:bg-white even:bg-[#fff9f5]">
                                            <td className="py-2 px-3 font-semibold text-slate-800 align-middle">{item.description}</td>
                                            <td className="py-2 px-3 font-semibold text-[#138024] align-middle">{formatNumber(item.ltrs)} L</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle">{item.transactions}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle">{item.distance > 0 ? formatNumber(item.distance) : '—'}</td>
                                            <td className="py-2 px-3 font-medium text-slate-600 align-middle">{item.kmPerLtr > 0 ? item.kmPerLtr.toFixed(2) : '—'}</td>
                                            <td className={`py-2 px-3 font-bold align-middle ${item.ltrsPer100Km > 15 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {item.ltrsPer100Km > 0 ? `${item.ltrsPer100Km.toFixed(1)} L/100Km` : '—'}
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
