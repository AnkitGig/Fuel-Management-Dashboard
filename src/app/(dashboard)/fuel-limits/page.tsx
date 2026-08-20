// src/app/(dashboard)/fuel-limits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { fuelIssueService } from '@/services/fuelIssueService';
import { formatNumber } from '@/lib/utils';
import { useClientStore } from '@/services/api';

interface FuelLimitRecord {
    asset: string; // RegistrationNo
    vehicleName: string; // DriverAttendant or Depot
    department: string;
    limitType: 'No Limit' | 'Limit';
    fuelLimit: number | 'No Limit';
    monthlyFuelUsed: number;
}

export default function FuelLimitsPage() {
    const selectedClient = useClientStore((state) => state.selectedClient);
    const [limits, setLimits] = useState<FuelLimitRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadLimitsAndUsage();
    }, [selectedClient]);

    const loadLimitsAndUsage = async () => {
        try {
            setLoading(true);

            // Fetch live transactions from API
            const response = await fuelIssueService.getFuelIssues({
                page: 1,
                pageSize: 2000,
            });

            // Group transactions to find unique vehicles and sum monthly consumption
            const usageMap: Record<string, { ltrs: number; name: string; dept: string }> = {};
            response.data.forEach((tx: any) => {
                const vehicle = (tx.vehicleId || 'Unknown').toUpperCase();
                if (!usageMap[vehicle]) {
                    usageMap[vehicle] = {
                        ltrs: 0,
                        name: tx.driverAttendant || tx.depot || 'Fleet Vehicle',
                        dept: tx.depot || 'General'
                    };
                }
                usageMap[vehicle].ltrs += tx.fuelQuantity || 0;
            });

            // Load saved limit configurations from localStorage
            let savedConfig: Record<string, { limitType: 'No Limit' | 'Limit'; fuelLimit: number | 'No Limit' }> = {};
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(`fuel_limits_config_${selectedClient.clientid}`);
                if (stored) {
                    try {
                        savedConfig = JSON.parse(stored);
                    } catch {
                        savedConfig = {};
                    }
                }
            }

            // Map everything to FuelLimitRecord
            const records: FuelLimitRecord[] = Object.keys(usageMap).map(vehicleId => {
                const live = usageMap[vehicleId];
                // Check if user set a custom limit, otherwise default to "No Limit"
                const custom = savedConfig[vehicleId] || { limitType: 'No Limit', fuelLimit: 'No Limit' };

                return {
                    asset: vehicleId,
                    vehicleName: live.name,
                    department: live.dept,
                    limitType: custom.limitType,
                    fuelLimit: custom.fuelLimit,
                    monthlyFuelUsed: Number(live.ltrs.toFixed(2))
                };
            });

            // Sort by monthly fuel used descending
            records.sort((a, b) => b.monthlyFuelUsed - a.monthlyFuelUsed);
            setLimits(records);
        } catch (err) {
            console.error('Failed to load live limits usage:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = limits.filter((item) => {
        const query = search.toLowerCase();
        return (
            item.asset.toLowerCase().includes(query) ||
            item.vehicleName.toLowerCase().includes(query) ||
            item.department.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fuel Limits</h1>
                    <p className="text-muted-foreground">Monitor vehicle limits & track monthly usage</p>
                </div>
            </div>

            <Card className="rounded-none border border-slate-200 shadow-xs">
                <CardHeader className="pb-3 px-6">
                    <CardTitle>Fuel Allowances</CardTitle>
                    <CardDescription>Monthly fuel limit allocations and live balance remaining.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 px-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by asset, vehicle, or department..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-none border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <Button className="bg-[#00c0b5] hover:bg-[#00a896] text-white rounded-none" size="sm">Search</Button>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>

                    <div className="overflow-x-auto border-y border-slate-200 shadow-xs">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Asset (Rego)</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Vehicle Name</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Department</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Limit Type</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">FUEL LIMIT (L)</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">MONTHLY FUEL USED (L)</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold last:border-r-0">FUEL BALANCE REMAINING</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400 bg-slate-50">
                                            No limits configuration found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, idx) => {
                                        const limitVal = item.fuelLimit;
                                        const remaining = limitVal === 'No Limit' ? 'No Limit' : limitVal - item.monthlyFuelUsed;
                                        return (
                                            <tr key={idx} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                                                <td className="py-2 px-3 font-semibold text-slate-800 align-middle border-r border-slate-200">{item.asset}</td>
                                                <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{item.vehicleName}</td>
                                                <td className="py-2 px-3 text-slate-500 align-middle border-r border-slate-200">{item.department}</td>
                                                <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{item.limitType}</td>
                                                <td className="py-2 px-3 font-semibold text-slate-800 align-middle border-r border-slate-200">
                                                    {typeof limitVal === 'number' ? `${formatNumber(limitVal)} L` : limitVal}
                                                </td>
                                                <td className="py-2 px-3 font-semibold text-[#138024] align-middle border-r border-slate-200">{formatNumber(item.monthlyFuelUsed)} L</td>
                                                <td className={`py-2 px-3 font-bold align-middle ${typeof remaining === 'number' && remaining < 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {typeof remaining === 'number' ? `${formatNumber(Number(remaining.toFixed(2)))} L` : remaining}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </PageContainer>
    );
}
