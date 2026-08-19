// src/app/(dashboard)/fuel-limits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Plus, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { fuelIssueService } from '@/services/fuelIssueService';
import { formatNumber } from '@/lib/utils';
import { useClientStore } from '@/services/api';

interface FuelLimitRecord {
  asset: string;
  vehicleName: string;
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
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAsset, setNewAsset] = useState('');
    const [newName, setNewName] = useState('');
    const [newDept, setNewDept] = useState('');
    const [newLimitType, setNewLimitType] = useState<'No Limit' | 'Limit'>('Limit');
    const [newLimitValue, setNewLimitValue] = useState('');

    useEffect(() => {
        loadLimitsAndUsage();
    }, [selectedClient]);

    const loadLimitsAndUsage = async () => {
        try {
            setLoading(true);
            
            // Get manually added limits from localStorage (defaulting to empty array)
            let storedLimits: FuelLimitRecord[] = [];
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(`fuel_limits_${selectedClient.clientid}`);
                if (stored) {
                    try {
                        storedLimits = JSON.parse(stored);
                    } catch {
                        storedLimits = [];
                    }
                }
            }

            // Fetch live monthly transactions from API
            const response = await fuelIssueService.getFuelIssues({
                page: 1,
                pageSize: 2000,
            });

            // Sum quantities by vehicleId
            const usageMap: Record<string, number> = {};
            response.data.forEach((tx: any) => {
                const vehicle = (tx.vehicleId || '').toUpperCase();
                if (vehicle) {
                    usageMap[vehicle] = (usageMap[vehicle] || 0) + (tx.fuelQuantity || 0);
                }
            });

            // Map monthly fuel used from live API
            const updatedLimits = storedLimits.map(item => {
                const assetKey = item.asset.toUpperCase();
                const nameKey = item.vehicleName.toUpperCase();
                
                // Try matching asset code or name to live transaction vehicle ID
                const used = usageMap[assetKey] || usageMap[nameKey] || 0;
                return {
                    ...item,
                    monthlyFuelUsed: Number(used.toFixed(2))
                };
            });

            setLimits(updatedLimits);
        } catch (err) {
            console.error('Failed to load live limits usage:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLimit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAsset || !newName) return;

        const record: FuelLimitRecord = {
            asset: newAsset,
            vehicleName: newName,
            department: newDept || 'General',
            limitType: newLimitType,
            fuelLimit: newLimitType === 'No Limit' ? 'No Limit' : Number(newLimitValue) || 0,
            monthlyFuelUsed: 0
        };

        const updated = [...limits, record];
        setLimits(updated);

        if (typeof window !== 'undefined') {
            localStorage.setItem(`fuel_limits_${selectedClient.clientid}`, JSON.stringify(updated));
        }

        // Reset
        setNewAsset('');
        setNewName('');
        setNewDept('');
        setNewLimitType('Limit');
        setNewLimitValue('');
        setIsModalOpen(false);
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
                    <p className="text-muted-foreground">Manage manually added vehicle limits & track monthly usage</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vehicle Limit
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Fuel Allowances</CardTitle>
                    <CardDescription>Monthly fuel limit allocations and live balance remaining</CardDescription>
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
                                    <th className="text-left p-3 font-semibold text-slate-200">Asset (Rego)</th>
                                    <th className="text-left p-3 font-semibold text-slate-200">Vehicle Name</th>
                                    <th className="text-left p-3 font-semibold text-slate-200">Department</th>
                                    <th className="text-left p-3 font-semibold text-slate-200">Limit Type</th>
                                    <th className="text-left p-3 font-semibold text-slate-200">FUEL LIMIT (L)</th>
                                    <th className="text-left p-3 font-semibold text-slate-200">MONTHLY FUEL USED (L)</th>
                                    <th className="text-left p-3 font-semibold text-slate-200">FUEL BALANCE REMAINING</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                            No limits configuration found. Please add a vehicle manually using the "Add Vehicle Limit" button.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, idx) => {
                                        const limitVal = item.fuelLimit;
                                        const remaining = limitVal === 'No Limit' ? 'No Limit' : limitVal - item.monthlyFuelUsed;
                                        return (
                                            <tr key={idx} className="border-b hover:bg-muted/50">
                                                <td className="p-3 font-medium text-slate-100">{item.asset}</td>
                                                <td className="p-3">{item.vehicleName}</td>
                                                <td className="p-3 text-slate-400">{item.department}</td>
                                                <td className="p-3">{item.limitType}</td>
                                                <td className="p-3 font-semibold">
                                                    {typeof limitVal === 'number' ? `${formatNumber(limitVal)} L` : limitVal}
                                                </td>
                                                <td className="p-3 font-semibold text-teal-400">{formatNumber(item.monthlyFuelUsed)} L</td>
                                                <td className={`p-3 font-bold ${typeof remaining === 'number' && remaining < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
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

            {/* Manual Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="relative w-full max-w-md bg-[#02172e] border border-[#00c0b5]/20 text-white rounded-xl shadow-xl p-6">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        
                        <h2 className="text-xl font-bold text-slate-100 mb-4">Add Vehicle Limit</h2>
                        
                        <form onSubmit={handleAddLimit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Asset (Rego / Code)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. BFE131"
                                    value={newAsset}
                                    onChange={(e) => setNewAsset(e.target.value)}
                                    className="w-full bg-[#052244] border border-[#00c0b5]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00c0b5]"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Vehicle Name / Model</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Toyota Hi-Ace"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-[#052244] border border-[#00c0b5]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00c0b5]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Department</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Security Ops"
                                    value={newDept}
                                    onChange={(e) => setNewDept(e.target.value)}
                                    className="w-full bg-[#052244] border border-[#00c0b5]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00c0b5]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Limit Type</label>
                                <select
                                    value={newLimitType}
                                    onChange={(e) => setNewLimitType(e.target.value as any)}
                                    className="w-full bg-[#052244] border border-[#00c0b5]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00c0b5]"
                                >
                                    <option value="Limit" className="bg-[#02172e]">Limit</option>
                                    <option value="No Limit" className="bg-[#02172e]">No Limit</option>
                                </select>
                            </div>

                            {newLimitType === 'Limit' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Fuel Limit (Litres)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="e.g. 150"
                                        value={newLimitValue}
                                        onChange={(e) => setNewLimitValue(e.target.value)}
                                        className="w-full bg-[#052244] border border-[#00c0b5]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00c0b5]"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white hover:text-[#00c0b5] border-slate-700 hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-[#00c0b5] text-white hover:bg-[#00a89d]">
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
