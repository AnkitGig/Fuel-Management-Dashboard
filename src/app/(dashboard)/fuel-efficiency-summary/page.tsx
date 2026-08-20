// src/app/(dashboard)/fuel-efficiency-summary/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, AlertTriangle, RefreshCw } from 'lucide-react';
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Fuel Efficiency Summary</h1>
                    <p className="text-slate-500 text-xs">Detailed view of vehicle fuel burn rates and usage (Calculated from Live API)</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm" className="h-7 text-xs px-2.5">
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Refresh
                </Button>
            </div>

            <Card className="rounded-none border border-slate-200 shadow-xs">
                <CardHeader className="py-1.5 px-4 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-sm font-semibold text-slate-800">Fleet Summary</CardTitle>
                        <CardDescription className="text-slate-500 text-[11px]">Fuel efficiency analysis per vehicle</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-2">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2 px-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by vehicle..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-none border border-slate-300 bg-white pl-8 pr-3 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-xs"
                            />
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-none h-7 text-xs px-3" size="sm">Search</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Export
                        </Button>
                    </div>

                    <div className="overflow-x-auto border-y border-slate-200 shadow-xs">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Vehicle Description</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Ltrs</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">No. of Transactions</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Distance (KM)</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Fuel Burn (Km/L)</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold last:border-r-0">Fuel Burn (L/100Km)</th>
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
                                        <tr key={idx} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="py-2 px-3 font-semibold text-slate-800 align-middle border-r border-slate-200">{item.description}</td>
                                            <td className="py-2 px-3 font-semibold text-[#138024] align-middle border-r border-slate-200">{formatNumber(item.ltrs)} L</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{item.transactions}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{item.distance > 0 ? formatNumber(item.distance) : '—'}</td>
                                            <td className="py-2 px-3 font-medium text-slate-600 align-middle border-r border-slate-200">{item.kmPerLtr > 0 ? item.kmPerLtr.toFixed(2) : '—'}</td>
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
