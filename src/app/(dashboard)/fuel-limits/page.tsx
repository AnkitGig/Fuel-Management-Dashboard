// src/app/(dashboard)/fuel-limits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, Edit2, X, AlertTriangle } from 'lucide-react';
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
    
    // Edit Limit modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<FuelLimitRecord | null>(null);
    const [editLimitType, setEditLimitType] = useState<'No Limit' | 'Limit'>('Limit');
    const [editLimitValue, setEditLimitValue] = useState('');

    useEffect(() => {
        loadLimitsAndUsage();
    }, [selectedClient]);

    const loadLimitsAndUsage = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch live transactions from API
            const response = await fuelIssueService.getFuelIssues({
                page: 1,
                pageSize: 2000,
            });

            // 2. Group transactions to find unique vehicles and sum monthly consumption
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

            // 3. Load saved limit configurations from localStorage
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

            // 4. Map everything to FuelLimitRecord
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

    const handleEditClick = (record: FuelLimitRecord) => {
        setSelectedRecord(record);
        setEditLimitType(record.limitType);
        setEditLimitValue(record.fuelLimit === 'No Limit' ? '150' : record.fuelLimit.toString());
        setIsModalOpen(true);
    };

    const handleSaveLimit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;

        // 1. Load current configs
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

        // 2. Add or update active vehicle config
        savedConfig[selectedRecord.asset] = {
            limitType: editLimitType,
            fuelLimit: editLimitType === 'No Limit' ? 'No Limit' : Number(editLimitValue) || 0
        };

        // 3. Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(`fuel_limits_config_${selectedClient.clientid}`, JSON.stringify(savedConfig));
        }

        setIsModalOpen(false);
        setSelectedRecord(null);
        loadLimitsAndUsage();
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
                    <p className="text-muted-foreground">Monitor vehicle limits & track monthly usage (Live API Data)</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Fuel Allowances</CardTitle>
                    <CardDescription>Monthly fuel limit allocations and live balance remaining. Click the Edit button on any row to customize limits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by asset, vehicle, or department..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="text-left p-3 font-semibold">Asset (Rego)</th>
                                    <th className="text-left p-3 font-semibold">Vehicle Name</th>
                                    <th className="text-left p-3 font-semibold">Department</th>
                                    <th className="text-left p-3 font-semibold">Limit Type</th>
                                    <th className="text-left p-3 font-semibold">FUEL LIMIT (L)</th>
                                    <th className="text-left p-3 font-semibold">MONTHLY FUEL USED (L)</th>
                                    <th className="text-left p-3 font-semibold">FUEL BALANCE REMAINING</th>
                                    <th className="text-left p-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-4 text-center text-muted-foreground">
                                            No limits configuration found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, idx) => {
                                        const limitVal = item.fuelLimit;
                                        const remaining = limitVal === 'No Limit' ? 'No Limit' : limitVal - item.monthlyFuelUsed;
                                        return (
                                            <tr key={idx} className="border-b hover:bg-muted/50">
                                                <td className="p-3 font-medium">{item.asset}</td>
                                                <td className="p-3">{item.vehicleName}</td>
                                                <td className="p-3 text-muted-foreground">{item.department}</td>
                                                <td className="p-3">{item.limitType}</td>
                                                <td className="p-3 font-semibold">
                                                    {typeof limitVal === 'number' ? `${formatNumber(limitVal)} L` : limitVal}
                                                </td>
                                                <td className="p-3 font-semibold text-teal-600">{formatNumber(item.monthlyFuelUsed)} L</td>
                                                <td className={`p-3 font-bold ${typeof remaining === 'number' && remaining < 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {typeof remaining === 'number' ? `${formatNumber(Number(remaining.toFixed(2)))} L` : remaining}
                                                </td>
                                                <td className="p-3">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleEditClick(item)}
                                                        className="text-teal-600 hover:text-teal-700"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
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

            {/* Edit Limit Modal */}
            {isModalOpen && selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="relative w-full max-w-md bg-[#02172e] border border-[#00c0b5]/20 text-white rounded-xl shadow-xl p-6">
                        <button 
                            onClick={() => {
                                setIsModalOpen(false);
                                setSelectedRecord(null);
                            }}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        
                        <h2 className="text-xl font-bold text-slate-100 mb-2">Configure Fuel Limit</h2>
                        <p className="text-sm text-slate-400 mb-4">Set allowance limit for {selectedRecord.asset} ({selectedRecord.vehicleName})</p>
                        
                        <form onSubmit={handleSaveLimit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Limit Type</label>
                                <select
                                    value={editLimitType}
                                    onChange={(e) => setEditLimitType(e.target.value as any)}
                                    className="w-full bg-[#052244] border border-[#00c0b5]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00c0b5]"
                                >
                                    <option value="Limit" className="bg-[#02172e]">Limit</option>
                                    <option value="No Limit" className="bg-[#02172e]">No Limit</option>
                                </select>
                            </div>

                            {editLimitType === 'Limit' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Fuel Limit (Litres)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="e.g. 150"
                                        value={editLimitValue}
                                        onChange={(e) => setEditLimitValue(e.target.value)}
                                        className="w-full bg-[#052244] border border-[#00c0b5]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00c0b5]"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedRecord(null);
                                    }}
                                    className="text-white hover:text-[#00c0b5] border-slate-700 hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-[#00c0b5] text-white hover:bg-[#00a89d]">
                                    Save Limit
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
