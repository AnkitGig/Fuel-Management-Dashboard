// src/app/fuel-levels/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { fuelLevelService } from '@/services/fuelLevelService';
import { authService } from '@/lib/auth';
import { formatDate, formatDateTime, formatFuel, delay } from '@/lib/utils';
import { FuelLevel } from '@/types/fuel';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function FuelLevelsPage() {
    const router = useRouter();
    const [levels, setLevels] = useState<FuelLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [currentLevel, setCurrentLevel] = useState<FuelLevel | null>(null);
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
    }, [router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fuelLevelService.getFuelLevels({ pageSize: 50 });
            setLevels(response.data);
            const current = await fuelLevelService.getCurrentLevel();
            setCurrentLevel(current);
            setError(null);
        } catch (err) {
            setError('Failed to load fuel level data');
        } finally {
            setLoading(false);
        }
    };

    const filteredLevels = levels.filter(level => {
        const matchesSearch = search === '' ||
            level.date.includes(search) ||
            level.status.toLowerCase().includes(search.toLowerCase());
        const matchesDate = selectedDate === '' || level.date === selectedDate;
        return matchesSearch && matchesDate;
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
                    <h1 className="text-3xl font-bold tracking-tight">Fuel Levels</h1>
                    <p className="text-muted-foreground">Monitor tank levels and historical data</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Current Level Card */}
            {currentLevel && (
                <Card>
                    <CardHeader>
                        <CardTitle>Current Tank Status</CardTitle>
                        <CardDescription>Real-time fuel level monitoring</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Current Level</p>
                                <p className="text-2xl font-bold">{formatFuel(currentLevel.fuelLevel)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Percentage</p>
                                <p className="text-2xl font-bold">{currentLevel.percentage}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <StatusBadge status={currentLevel.status} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="text-lg font-medium">{formatDateTime(currentLevel.updatedAt)}</p>
                            </div>
                        </div>
                        <div className="mt-4 h-4 w-full rounded-full bg-secondary">
                            <div
                                className="h-4 rounded-full bg-primary transition-all"
                                style={{ width: `${currentLevel.percentage}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Historical Data */}
            <Card>
                <CardHeader>
                    <CardTitle>Historical Fuel Levels</CardTitle>
                    <CardDescription>Track fuel level trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by date or status..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="h-[300px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredLevels.slice(0, 30)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'fuelLevel') return [formatFuel(Number(value)), 'Fuel Level'];
                                        if (name === 'percentage') return [`${value}%`, 'Percentage'];
                                        return [value, name];
                                    }}
                                />
                                <Line type="monotone" dataKey="fuelLevel" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium">Date</th>
                                    <th className="text-left p-3 font-medium">Time</th>
                                    <th className="text-left p-3 font-medium">Fuel Level</th>
                                    <th className="text-left p-3 font-medium">Percentage</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLevels.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                            No fuel level records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLevels.map((level) => (
                                        <tr key={level.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">{level.date}</td>
                                            <td className="p-3">{level.time}</td>
                                            <td className="p-3 font-medium">{formatFuel(level.fuelLevel)}</td>
                                            <td className="p-3">{level.percentage}%</td>
                                            <td className="p-3">
                                                <StatusBadge status={level.status} />
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