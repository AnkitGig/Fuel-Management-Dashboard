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
    const [selectedDate, setSelectedDate] = useState('');

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
        const matchesDate = selectedDate ? level.date === selectedDate : true;
        return matchesSearch && matchesDate;
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fuel Levels</h1>
                    <p className="text-muted-foreground">Monitor tank levels and historical data</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Historical Data */}
            <Card className="rounded-none border border-slate-200 shadow-xs">
                <CardHeader className="pb-3 px-6">
                    <CardTitle>Historical Fuel Levels</CardTitle>
                    <CardDescription>Track fuel level trends over time</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 px-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by date or status..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-none border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Area Chart matching the screenshot exactly */}
                    <div className="h-[350px] mb-6 px-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#74b9ff" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#74b9ff" stopOpacity={0.1} />
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

                                            // Render exact custom tooltip from screenshot style
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
                </CardContent>
            </Card>
        </PageContainer>
    );
}
