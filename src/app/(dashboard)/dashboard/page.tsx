// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowUp,
    ArrowDown,
    Fuel,
    Truck,
    ClipboardList,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Droplet,
    Calendar,
    Download,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { dashboardService, DashboardData } from '@/services/dashboardService';
import { authService } from '@/lib/auth';
import { cn, formatFuel, formatNumber, getStatusColor } from '@/lib/utils';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('week');

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
            const dashboardData = await dashboardService.getDashboardData();
            setData(dashboardData);
            setError(null);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

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

    if (!data) return null;

    const {
        tankStatus,
        kpiData,
        fuelLevelTrend,
        deliveryTrend,
        consumptionTrend,
        vehicleFuelUsage,
        reconciliationSummary,
        recentTransactions,
        recentDeliveries,
        exceptions
    } = data;

    return (
        <PageContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Real-time fuel management overview
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-2xl border border-border/20 backdrop-blur-xs">
                    <Button
                        variant={dateRange === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDateRange('week')}
                        className="rounded-xl px-4 text-xs font-semibold"
                    >
                        7D
                    </Button>
                    <Button
                        variant={dateRange === 'month' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDateRange('month')}
                        className="rounded-xl px-4 text-xs font-semibold"
                    >
                        30D
                    </Button>
                    <Button
                        variant={dateRange === 'quarter' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDateRange('quarter')}
                        className="rounded-xl px-4 text-xs font-semibold"
                    >
                        90D
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl px-3.5 text-xs font-semibold hover:bg-muted">
                        <Calendar className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        Custom
                    </Button>
                </div>
            </div>

            {/* Tank Status Card */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-1 md:col-span-2 lg:col-span-1 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Current Fuel Level</CardTitle>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <Droplet className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{formatFuel(tankStatus.currentLevel)}</div>
                        <div className="flex items-center justify-between mt-2.5">
                            <p className="text-xs text-muted-foreground font-medium">
                                Capacity: {formatFuel(tankStatus.capacity)}
                            </p>
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border border-current bg-current/5", getStatusColor(tankStatus.status))}>
                                {tankStatus.percentage}%
                            </span>
                        </div>
                        <div className="mt-4 h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                                style={{ width: `${tankStatus.percentage}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Fuel Delivered</CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <ArrowUp className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{formatFuel(kpiData.fuelDelivered)}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Fuel Issued</CardTitle>
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                            <ArrowDown className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{formatFuel(kpiData.fuelIssued)}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Vehicles</CardTitle>
                        <div className="p-2 rounded-xl bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400">
                            <Truck className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{kpiData.vehicles}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Active assets</p>
                    </CardContent>
                </Card>
            </div>

            {/* Second row of KPI cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Transactions</CardTitle>
                        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                            <ClipboardList className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{kpiData.transactions}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Reconciliation</CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <CheckCircle className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mt-0.5">
                            <StatusBadge status={kpiData.reconciliationStatus} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2.5 font-medium">
                            Variance: {formatFuel(kpiData.variance)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Current Consumption</CardTitle>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                            <Fuel className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{formatFuel(kpiData.currentConsumption)}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Per day average</p>
                    </CardContent>
                </Card>

                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Exceptions</CardTitle>
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 animate-pulse">
                            <AlertTriangle className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{exceptions.length}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Requires attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="overflow-hidden">
                    <CardHeader className="border-b border-border/10 pb-4">
                        <CardTitle className="text-lg font-bold">Fuel Level Trend</CardTitle>
                        <CardDescription>Historical fuel levels over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={fuelLevelTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255, 255, 255, 0.5)',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
                                        }}
                                        formatter={(value) => [`${formatFuel(Number(value))}`, 'Fuel Level']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="level"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="border-b border-border/10 pb-4">
                        <CardTitle className="text-lg font-bold">Fuel Delivery Trend</CardTitle>
                        <CardDescription>Deliveries over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deliveryTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255, 255, 255, 0.5)',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
                                        }}
                                        formatter={(value) => [`${formatFuel(Number(value))}`, 'Delivery']}
                                    />
                                    <Bar dataKey="amount" fill="url(#deliveryGrad)" radius={[6, 6, 0, 0]}>
                                        {/* Gradient fill */}
                                        <defs>
                                            <linearGradient id="deliveryGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                                            </linearGradient>
                                        </defs>
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="overflow-hidden">
                    <CardHeader className="border-b border-border/10 pb-4">
                        <CardTitle className="text-lg font-bold">Fuel Consumption Trend</CardTitle>
                        <CardDescription>Daily fuel consumption</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={consumptionTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255, 255, 255, 0.5)',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
                                        }}
                                        formatter={(value) => [`${formatFuel(Number(value))}`, 'Consumption']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="consumption"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e0b' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="border-b border-border/10 pb-4">
                        <CardTitle className="text-lg font-bold">Vehicle Fuel Usage</CardTitle>
                        <CardDescription>Top vehicles by fuel consumption</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={vehicleFuelUsage}
                                        dataKey="fuelUsed"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                    >
                                        {vehicleFuelUsage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255, 255, 255, 0.5)',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
                                        }}
                                        formatter={(value) => `${formatFuel(Number(value))}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reconciliation Summary */}
            <Card className="overflow-hidden">
                <CardHeader className="border-b border-border/10 pb-4">
                    <CardTitle className="text-lg font-bold">Reconciliation Summary</CardTitle>
                    <CardDescription>Today's fuel reconciliation status</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-7">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/30">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opening</p>
                            <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">{formatFuel(reconciliationSummary.openingBalance)}</p>
                        </div>
                        <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/10">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Deliveries</p>
                            <p className="text-base font-bold text-emerald-600 mt-1">+{formatFuel(reconciliationSummary.deliveries)}</p>
                        </div>
                        <div className="p-3.5 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/10">
                            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Fuel Issues</p>
                            <p className="text-base font-bold text-rose-600 mt-1">-{formatFuel(reconciliationSummary.fuelIssues)}</p>
                        </div>
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/30">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expected</p>
                            <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">{formatFuel(reconciliationSummary.expectedClosing)}</p>
                        </div>
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/30">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actual</p>
                            <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">{formatFuel(reconciliationSummary.actualClosing)}</p>
                        </div>
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/30">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variance</p>
                            <p className={`text-base font-bold mt-1 ${reconciliationSummary.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {reconciliationSummary.variance >= 0 ? '+' : ''}{formatFuel(reconciliationSummary.variance)}
                            </p>
                        </div>
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/30 flex flex-col justify-center">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                            <StatusBadge status={reconciliationSummary.status} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions and Deliveries */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
                            <CardDescription>Latest fuel transactions</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl px-3 text-xs font-semibold hover:bg-muted">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-1">
                            {recentTransactions.slice(0, 5).map((txn) => (
                                <div key={txn.id} className="flex items-center justify-between p-2 hover:bg-slate-500/5 rounded-xl transition-all duration-200">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{txn.id}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                            {txn.vehicleId || 'Delivery'} • {txn.date}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{formatFuel(txn.quantity)}</p>
                                        <div className="mt-1">
                                            <StatusBadge status={txn.status} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold">Recent Deliveries</CardTitle>
                            <CardDescription>Latest fuel deliveries</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl px-3 text-xs font-semibold hover:bg-muted">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-1">
                            {recentDeliveries.slice(0, 5).map((delivery) => (
                                <div key={delivery.id} className="flex items-center justify-between p-2 hover:bg-slate-500/5 rounded-xl transition-all duration-200">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{delivery.id}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                            {delivery.supplier} • {delivery.date}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{formatFuel(delivery.quantity)}</p>
                                        <div className="mt-1">
                                            <StatusBadge status={delivery.status} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Exceptions */}
            {exceptions.length > 0 && (
                <Card className="overflow-hidden border-rose-500/10 bg-rose-500/[0.01]">
                    <CardHeader className="border-b border-rose-500/10 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Exceptions & Alerts
                        </CardTitle>
                        <CardDescription>Items requiring immediate attention</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-1">
                            {exceptions.map((exc) => (
                                <div key={exc.id} className="flex items-center justify-between p-2 hover:bg-rose-500/5 rounded-xl transition-all duration-200">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{exc.type}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">{exc.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground font-medium">{exc.date}</p>
                                        <div className="mt-1">
                                            <StatusBadge status={exc.severity} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </PageContainer>
    );
}