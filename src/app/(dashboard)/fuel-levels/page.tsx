// src/app/(dashboard)/fuel-levels/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { fuelLevelService } from '@/services/fuelLevelService';
import { authService } from '@/lib/auth';
import { formatNumber } from '@/lib/utils';
import { FuelLevel } from '@/types/fuel';
import { useClientStore } from '@/services/api';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function FuelLevelsPage() {
    const router = useRouter();
    const selectedClient = useClientStore((state) => state.selectedClient);
    const [levels, setLevels] = useState<FuelLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
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
    }, [router, selectedClient]); // Reload when client changes

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fuelLevelService.getFuelLevels({ pageSize: 1000 });

            // Sort chronologically by BOTH Date and Time for correct area chart trend line mapping
            const sortedData = [...response.data].sort((a, b) => {
                const timeA = new Date(`${a.date}T${a.time}Z`).getTime();
                const timeB = new Date(`${b.date}T${b.time}Z`).getTime();
                return timeA - timeB;
            });

            setLevels(sortedData);
            setError(null);
        } catch (err) {
            setError('Failed to load fuel level data');
        } finally {
            setLoading(false);
        }
    };

    const filteredLevels = levels.filter((level) => {
        const matchesSearch =
            level.date.includes(search) ||
            level.status.toLowerCase().includes(search);

        let matchesDateRange = true;
        if (startDate) {
            matchesDateRange = matchesDateRange && level.date >= startDate;
        }
        if (endDate) {
            matchesDateRange = matchesDateRange && level.date <= endDate;
        }

        return matchesSearch && matchesDateRange;
    });

    const formatDateTick = (tickItem: string) => {
        try {
            const date = new Date(tickItem);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = String(date.getDate()).padStart(2, '0');
            return `${months[date.getMonth()]} ${day}`;
        } catch {
            return tickItem;
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="flex h-[50vh] items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <p className="text-lg text-muted-foreground">{error}</p>
                    <Button onClick={loadData}>Try Again</Button>
                </div>
            </PageContainer>
        );
    }

    // Prepare chart data (slice to latest 60 points for better readability)
    const chartData = filteredLevels.slice(-60);

    return (
        <PageContainer>
            {/* Header section matching bootstrap layout exactly */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h4 className="font-bold text-zinc-900 text-lg leading-none m-0">Fuel Levels</h4>
                    <span className="text-xs text-zinc-500 mt-0.5 inline-block">Monitor tank levels and historical data</span>
                </div>
                <Button
                    onClick={loadData}
                    className="bg-[#3c8e75] hover:bg-[#317561] text-white text-xs font-semibold rounded px-3 py-1.5 flex items-center gap-1 transition-colors duration-200 border-0 h-8 shadow-sm"
                >
                    <RefreshCw className="h-3.5 w-3.5 mr-0.5" />
                    Refresh
                </Button>
            </div>

            {/* Filters & Chart Card wrapper */}
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
                                        placeholder="Search by date or status..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="flex-1 border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#f26522] focus:border-[#f26522] h-9 rounded-none"
                                    />
                                </div>
                                <Button
                                    onClick={() => { }}
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

                {/* Area Chart matching the bootstrap design */}
                <div style={{ height: '380px' }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <defs>
                                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3498db" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#3498db" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="createdAt"
                                tickFormatter={formatDateTick}
                                tick={{ fill: '#666', fontSize: 11 }}
                                axisLine={{ stroke: '#ccc' }}
                            />
                            <YAxis
                                tickFormatter={(val) => formatNumber(val)}
                                tick={{ fill: '#666', fontSize: 11 }}
                                axisLine={{ stroke: '#ccc' }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const val = Number(payload[0].value);
                                        const date = payload[0].payload.date;
                                        const time = payload[0].payload.time;

                                        return (
                                            <div className="bg-white border border-[#3498db]/40 p-3 rounded shadow-lg text-xs">
                                                <p className="font-bold text-slate-800">{formatDateTick(date)} {time}</p>
                                                <div className="flex items-center gap-1.5 mt-1 font-semibold text-[#2980b9]">
                                                    <span>🛢️ {formatNumber(val)} L</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="fuelLevel"
                                stroke="#3498db"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorFuel)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </PageContainer>
    );
}
