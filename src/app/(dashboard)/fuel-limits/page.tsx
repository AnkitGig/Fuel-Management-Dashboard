// src/app/(dashboard)/fuel-limits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, AlertTriangle, Sliders } from 'lucide-react';
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
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="font-semibold text-zinc-900 text-2xl leading-tight m-0">Fuel Limits</h2>
                    <span className="text-sm text-zinc-500 mt-1 inline-block">Monitor vehicle limits & track monthly usage</span>
                </div>
            </div>

            <Card className="rounded border border-slate-200 shadow-sm p-4 mb-4">
                <CardContent className="p-0">
                    {/* Filter bar container matching the bootstrap grid structure */}
                    <div className="mb-4 py-2.5 px-4 bg-[#eefcf2] border border-[#d6f2e1] rounded w-full">
                        <div className="grid grid-cols-12 gap-2 items-end">
                            {/* Search Input Group */}
                            <div className="col-span-12 md:col-span-8 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Search transactions</label>
                                <div className="flex h-8">
                                    <span className="flex items-center px-3 border border-r-0 border-slate-200 bg-slate-50 rounded-l text-slate-400">
                                        <Search className="h-3 w-3" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search by asset, vehicle, or department..."
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

                    <div className="overflow-x-auto border-y border-slate-200 shadow-xs">
                        <table className="w-full text-sm border-collapse whitespace-nowrap">
                            <thead>
                                <tr>
                                    <th className="bg-[#f26522] text-white py-2 px-3 text-left font-semibold">Asset (Rego)</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Vehicle Name</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Department</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">Limit Type</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">FUEL LIMIT (L)</th>
                                    <th className="bg-[#137e19] text-white py-2 px-3 text-left font-semibold">MONTHLY FUEL USED (L)</th>
                                    <th className="bg-[#555555] text-white py-2 px-3 text-left font-semibold">FUEL BALANCE REMAINING</th>
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
                                                <td className="py-2 px-3 font-semibold text-slate-800 align-middle">{item.asset}</td>
                                                <td className="py-2 px-3 text-slate-600 align-middle">{item.vehicleName}</td>
                                                <td className="py-2 px-3 text-slate-500 align-middle">{item.department}</td>
                                                <td className="py-2 px-3 text-slate-600 align-middle">{item.limitType}</td>
                                                <td className="py-2 px-3 font-semibold text-slate-800 align-middle">
                                                    {typeof limitVal === 'number' ? `${formatNumber(limitVal)} L` : limitVal}
                                                </td>
                                                <td className="py-2 px-3 font-semibold text-[#138024] align-middle">{formatNumber(item.monthlyFuelUsed)} L</td>
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
