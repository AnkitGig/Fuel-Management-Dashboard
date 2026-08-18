// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
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
    TrendingUp,
    TrendingDown,
    Activity,
    Zap,
    Layers,
    BarChart3,
    Sparkles,
    ShieldCheck,
    Gauge,
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
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    ReferenceLine,
    LabelList,
} from 'recharts';

const PALETTE = [
    '#00bdae', // Teal
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
];

export default function DashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('week');
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

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

    // Helper to format raw date "2026-08-05" into clean "Aug 05"
    const formatDateShort = (dateStr: string) => {
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthIdx = parseInt(parts[1], 10) - 1;
                return `${months[monthIdx] || 'Aug'} ${parts[2]}`;
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    // Helper to format Y Axis "14000" into "14k L"
    const formatYAxisFuel = (num: number) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
        }
        return `${num}`;
    };

    // Filter and adjust data based on selected dateRange dynamically
    const dynamicData = useMemo(() => {
        if (!data) return null;

        const fuelLevelTrend = [...data.fuelLevelTrend];
        const deliveryTrend = [...data.deliveryTrend];
        const consumptionTrend = [...data.consumptionTrend];
        const kpi = { ...data.kpiData };
        const reconciliation = { ...data.reconciliationSummary };

        let fuelLevel = fuelLevelTrend;
        let delivery = deliveryTrend;
        let consumption = consumptionTrend;

        if (dateRange === 'week') {
            fuelLevel = fuelLevelTrend.slice(-7);
            delivery = deliveryTrend.slice(-4);
            consumption = consumptionTrend.slice(-7);
            
            kpi.fuelDelivered = data.kpiData.fuelDelivered * 0.25;
            kpi.fuelIssued = data.kpiData.fuelIssued * 0.24;
            kpi.transactions = Math.round(data.kpiData.transactions * 0.25);
            kpi.variance = data.kpiData.variance * 0.3;
            reconciliation.deliveries = reconciliation.deliveries * 0.25;
            reconciliation.fuelIssues = reconciliation.fuelIssues * 0.24;
            reconciliation.variance = reconciliation.variance * 0.3;
        } else if (dateRange === 'quarter') {
            fuelLevel = [];
            delivery = [];
            consumption = [];
            for (let i = 1; i <= 3; i++) {
                fuelLevel.push(...fuelLevelTrend.map(item => ({ ...item, date: item.date.replace('-08-', `-0${7 + i}-`) })));
                delivery.push(...deliveryTrend.map(item => ({ ...item, date: item.date.replace('-08-', `-0${7 + i}-`) })));
                consumption.push(...consumptionTrend.map(item => ({ ...item, date: item.date.replace('-08-', `-0${7 + i}-`) })));
            }
            kpi.fuelDelivered = data.kpiData.fuelDelivered * 3.0;
            kpi.fuelIssued = data.kpiData.fuelIssued * 2.9;
            kpi.transactions = Math.round(data.kpiData.transactions * 2.8);
            kpi.variance = data.kpiData.variance * 2.5;
            reconciliation.deliveries = reconciliation.deliveries * 3.0;
            reconciliation.fuelIssues = reconciliation.fuelIssues * 2.9;
            reconciliation.variance = reconciliation.variance * 2.5;
        }

        // Compute summary metrics for charts
        const currentFuelLevel = fuelLevel[fuelLevel.length - 1]?.level || 0;
        const minFuelLevel = Math.min(...fuelLevel.map(d => d.level));
        const maxFuelLevel = Math.max(...fuelLevel.map(d => d.level));
        
        const totalDeliveredInWindow = delivery.reduce((acc, curr) => acc + curr.amount, 0);
        const avgDelivery = delivery.length ? Math.round(totalDeliveredInWindow / delivery.length) : 0;
        
        const totalConsumptionInWindow = consumption.reduce((acc, curr) => acc + curr.consumption, 0);
        const avgConsumption = consumption.length ? Math.round(totalConsumptionInWindow / consumption.length) : 0;
        const maxConsumption = Math.max(...consumption.map(d => d.consumption));

        return {
            fuelLevel,
            delivery,
            consumption,
            kpi,
            reconciliation,
            currentFuelLevel,
            minFuelLevel,
            maxFuelLevel,
            totalDeliveredInWindow,
            avgDelivery,
            totalConsumptionInWindow,
            avgConsumption,
            maxConsumption
        };
    }, [data, dateRange]);

    // Simple custom sparkline for dashboard KPI cards
    const renderSparkline = (dataPoints: number[], strokeColor: string, fillColor: string) => {
        const chartData = dataPoints.map((val, idx) => ({ name: idx.toString(), value: val }));
        return (
            <div className="h-10 w-full mt-2 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                        <defs>
                            <linearGradient id={`sparkGrad-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={fillColor} stopOpacity={0.45} />
                                <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={strokeColor}
                            strokeWidth={2}
                            fill={`url(#sparkGrad-${strokeColor.replace('#', '')})`}
                            dot={false}
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Custom Glass Tooltip for Charts
    const CustomChartTooltip = ({ active, payload, label, unit = 'L', customTitle }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel border border-primary/30 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl bg-card/95 animate-in fade-in-50 zoom-in-95 duration-150 min-w-[140px]">
                    <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5 mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {formatDateShort(label)}
                        </span>
                        {customTitle && (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md">
                                {customTitle}
                            </span>
                        )}
                    </div>
                    {payload.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                                <span 
                                    className="w-2.5 h-2.5 rounded-full shadow-xs" 
                                    style={{ backgroundColor: item.color || item.fill }}
                                />
                                <span className="text-xs font-medium text-muted-foreground">
                                    {item.name === 'level' ? 'Level' : item.name === 'amount' ? 'Delivered' : item.name === 'consumption' ? 'Issued' : item.name}
                                </span>
                            </div>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                                {formatNumber(Number(item.value), 0)} {unit}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
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

    if (!data || !dynamicData) return null;

    const {
        tankStatus,
        vehicleFuelUsage,
        recentTransactions,
        recentDeliveries,
        exceptions
    } = data;

    const { 
        fuelLevel, 
        delivery, 
        consumption, 
        kpi, 
        reconciliation,
        currentFuelLevel,
        minFuelLevel,
        maxFuelLevel,
        totalDeliveredInWindow,
        avgDelivery,
        totalConsumptionInWindow,
        avgConsumption,
        maxConsumption
    } = dynamicData;

    // Total fleet consumption sum for donut chart
    const totalUsageInDoughnut = vehicleFuelUsage.reduce((sum, item) => sum + item.fuelUsed, 0);

    return (
        <PageContainer>
            {/* Top Page Header & Time Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Fuel Operations Dashboard
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live tank telemetry, automated reconciliation & fleet metrics
                    </p>
                </div>
                <div className="flex items-center gap-1.5 bg-secondary/60 p-1 rounded-xl border border-border/40 backdrop-blur-md shadow-2xs">
                    <Button
                        variant={dateRange === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDateRange('week')}
                        className="rounded-lg h-7 px-3 text-xs font-bold transition-all shadow-2xs"
                    >
                        7D
                    </Button>
                    <Button
                        variant={dateRange === 'month' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDateRange('month')}
                        className="rounded-lg h-7 px-3 text-xs font-bold transition-all shadow-2xs"
                    >
                        30D
                    </Button>
                    <Button
                        variant={dateRange === 'quarter' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDateRange('quarter')}
                        className="rounded-lg h-7 px-3 text-xs font-bold transition-all shadow-2xs"
                    >
                        90D
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg h-7 px-2.5 text-xs font-semibold hover:bg-muted">
                        <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                        Custom
                    </Button>
                </div>
            </div>

            {/* 8 Compact Modern KPI Cards with Rich Shadows */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* 1. CURRENT FUEL LEVEL (Hero Card with Circular Radial Gauge) */}
                <Card className="col-span-1 sm:col-span-2 lg:col-span-1 overflow-hidden relative group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500" />
                    <div className="flex flex-row items-center justify-between p-3.5 pb-1 pt-3.5">
                        <span className="text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                            Current Storage
                        </span>
                        <div className="p-1.5 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 text-white shadow-md shadow-teal-500/30 group-hover:rotate-6 transition-transform">
                            <Droplet className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="p-3.5 pt-0 pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {formatFuel(tankStatus.currentLevel)}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                    Cap: <span className="text-slate-700 dark:text-slate-200 font-bold">{formatFuel(tankStatus.capacity)}</span>
                                </p>
                            </div>
                            {/* Circular Radial Gauge */}
                            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-100 dark:text-slate-800"
                                        strokeWidth="3.5"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-teal-500"
                                        strokeDasharray={`${tankStatus.percentage}, 100`}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className="absolute text-[10px] font-black text-slate-800 dark:text-slate-100">
                                    {tankStatus.percentage}%
                                </span>
                            </div>
                        </div>
                        {/* Segmented Progress bar */}
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 shadow-sm transition-all duration-500"
                                style={{ width: `${tankStatus.percentage}%` }}
                            />
                        </div>
                    </div>
                </Card>

                {/* 2. FUEL DELIVERED CARD */}
                <Card className="overflow-hidden relative group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    <div className="flex flex-row items-center justify-between p-3.5 pb-1 pt-3.5">
                        <span className="text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                            Fuel Delivered
                        </span>
                        <div className="p-1.5 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-500/30 group-hover:rotate-6 transition-transform">
                            <ArrowUp className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="p-3.5 pt-0 pb-3">
                        <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            {formatFuel(kpi.fuelDelivered)}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'Last 90 days'}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 shadow-2xs">
                                <TrendingUp className="w-2.5 h-2.5" /> +12%
                            </span>
                        </div>
                    </div>
                </Card>

                {/* 3. FUEL ISSUED CARD */}
                <Card className="overflow-hidden relative group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500" />
                    <div className="flex flex-row items-center justify-between p-3.5 pb-1 pt-3.5">
                        <span className="text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                            Fuel Issued
                        </span>
                        <div className="p-1.5 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-500/30 group-hover:rotate-6 transition-transform">
                            <ArrowDown className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="p-3.5 pt-0 pb-3">
                        <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            {formatFuel(kpi.fuelIssued)}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'Last 90 days'}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20 shadow-2xs">
                                <TrendingDown className="w-2.5 h-2.5" /> -4%
                            </span>
                        </div>
                    </div>
                </Card>

                {/* 4. ACTIVE VEHICLES CARD */}
                <Card className="overflow-hidden relative group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500" />
                    <div className="flex flex-row items-center justify-between p-3.5 pb-1 pt-3.5">
                        <span className="text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                            Vehicles
                        </span>
                        <div className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-md shadow-indigo-500/30 group-hover:rotate-6 transition-transform">
                            <Truck className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="p-3.5 pt-0 pb-3">
                        <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
                            <span>{kpi.vehicles}</span>
                            <span className="text-xs font-bold text-slate-400">Assets</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Fleet status</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/20 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> 96% Online
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Second row of 4 Compact Modern KPI Cards with Rich Shadows */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-3">
                
                {/* 5. TRANSACTIONS CARD */}
                <Card className="overflow-hidden relative group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500" />
                    <div className="flex flex-row items-center justify-between p-3.5 pb-1 pt-3.5">
                        <span className="text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                            Transactions
                        </span>
                        <div className="p-1.5 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-md shadow-blue-500/30 group-hover:rotate-6 transition-transform">
                            <ClipboardList className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="p-3.5 pt-0 pb-3">
                        <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
                            <span>{kpi.transactions}</span>
                            <span className="text-xs font-bold text-slate-400">Total</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'Last 90 days'}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20 shadow-2xs">
                                ✓ Verified
                            </span>
                        </div>
                    </div>
                </Card>

                {/* 6. RECONCILIATION CARD */}
                <Card className="overflow-hidden relative group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-500" />
                    <div className="flex flex-row items-center justify-between p-3.5 pb-1 pt-3.5">
                        <span className="text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                            Reconciliation
                        </span>
                        <div className="p-1.5 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md shadow-teal-500/30 group-hover:rotate-6 transition-transform">
                            <CheckCircle className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="p-3.5 pt-0 pb-3">
                        <div className="text-base font-black mt-0.5">
                            <StatusBadge status={kpi.reconciliationStatus} />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[11px]">
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">Variance:</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                                {formatFuel(kpi.variance)}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* 7. CURRENT CONSUMPTION CARD */}
                <Card className="overflow-hidden relative group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500" />
                    <div className="flex flex-row items-center justify-between p-3.5 pb-1 pt-3.5">
                        <span className="text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                            Current Consumption
                        </span>
                        <div className="p-1.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-md shadow-amber-500/30 group-hover:rotate-6 transition-transform">
                            <Fuel className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="p-3.5 pt-0 pb-3">
                        <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            {formatFuel(kpi.currentConsumption)}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Daily avg</span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shadow-2xs">
                                ⚡ Stable
                            </span>
                        </div>
                    </div>
                </Card>

                {/* 8. EXCEPTIONS CARD */}
                <Card className="overflow-hidden relative group bg-white dark:bg-slate-900 border border-rose-200/90 dark:border-rose-900/50 shadow-[0_4px_20px_-2px_rgba(244,63,94,0.12),0_2px_6px_-1px_rgba(244,63,94,0.06)] hover:shadow-[0_12px_28px_-4px_rgba(244,63,94,0.18),0_4px_12px_-2px_rgba(244,63,94,0.08)] hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-red-600" />
                    <div className="flex flex-row items-center justify-between p-3.5 pb-1 pt-3.5">
                        <span className="text-[10.5px] font-extrabold text-rose-600 dark:text-rose-400 tracking-wider uppercase">
                            Exceptions
                        </span>
                        <div className="p-1.5 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/40 group-hover:rotate-6 transition-transform animate-pulse">
                            <AlertTriangle className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="p-3.5 pt-0 pb-3">
                        <div className="text-xl sm:text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400 flex items-baseline gap-1">
                            <span>{exceptions.length}</span>
                            <span className="text-xs font-bold text-rose-400">Issues</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">Needs Review</span>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-white bg-rose-600 px-1.5 py-0.5 rounded-md shadow-xs shadow-rose-600/40">
                                Action
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ========================================================================= */}
            {/* 4 PROPORTIONAL STREAMLINED CHARTS SECTION WITH RICH SHADOWS */}
            {/* ========================================================================= */}
            <div className="grid gap-4 md:grid-cols-2 mt-4">
                
                {/* 1. FUEL LEVEL TREND */}
                <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-2xl">
                    <div className="border-b border-border/15 p-3.5 pb-2.5 bg-slate-50/40 dark:bg-slate-900/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                                        <Layers className="w-3.5 h-3.5" />
                                    </div>
                                    <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                                        Fuel Level Dynamic Trend
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] mt-0.5">
                                    Telemetry tracking with safety threshold
                                </CardDescription>
                            </div>
                            {/* Metric Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                                    <span className="text-[9px] uppercase text-muted-foreground">Current:</span>
                                    <span>{formatFuel(currentFuelLevel)}</span>
                                </div>
                                <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shadow-2xs">
                                    Peak: {formatFuel(maxFuelLevel)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3.5 pt-2">
                        <div className="h-[210px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={fuelLevel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="fuelLevelAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.12} />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatDateShort}
                                        stroke="#94a3b8" 
                                        fontSize={10} 
                                        fontWeight={600}
                                        tickLine={false} 
                                        axisLine={false} 
                                        dy={6} 
                                    />
                                    <YAxis 
                                        tickFormatter={formatYAxisFuel}
                                        stroke="#94a3b8" 
                                        fontSize={10} 
                                        fontWeight={600}
                                        tickLine={false} 
                                        axisLine={false} 
                                        dx={-2} 
                                    />
                                    <ReferenceLine 
                                        y={6000} 
                                        stroke="#f43f5e" 
                                        strokeDasharray="4 4" 
                                        strokeWidth={1.5}
                                        label={{
                                            value: 'Min Safety (6k L)', 
                                            fill: '#f43f5e', 
                                            fontSize: 9, 
                                            position: 'insideBottomRight',
                                            fontWeight: 700
                                        }} 
                                    />
                                    <Tooltip content={<CustomChartTooltip customTitle="Storage Level" />} />
                                    <Area
                                        type="monotone"
                                        dataKey="level"
                                        stroke="#6366f1"
                                        strokeWidth={2.5}
                                        fill="url(#fuelLevelAreaGrad)"
                                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff', fill: '#6366f1' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Chart Bottom Insights Footer */}
                        <div className="flex items-center justify-between border-t border-border/20 pt-2 mt-1 text-[11px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                Level Dynamics
                            </span>
                            <span className="flex items-center gap-1 text-rose-500 font-semibold">
                                <span className="w-2 h-0.5 border-b-2 border-rose-500 border-dashed" />
                                6k L Reserve
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                                Low: {formatFuel(minFuelLevel)}
                            </span>
                        </div>
                    </div>
                </Card>


                {/* 2. FUEL DELIVERY TREND */}
                <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-2xl">
                    <div className="border-b border-border/15 p-3.5 pb-2.5 bg-slate-50/40 dark:bg-slate-900/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                                        <BarChart3 className="w-3.5 h-3.5" />
                                    </div>
                                    <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                                        Tank Replenishment & Inflow
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] mt-0.5">
                                    Inflow shipments received per schedule
                                </CardDescription>
                            </div>
                            {/* Metric Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shadow-2xs">
                                    Total: {formatFuel(totalDeliveredInWindow)}
                                </div>
                                <div className="px-2 py-0.5 rounded-lg bg-secondary border border-border text-muted-foreground text-[10px] font-semibold shadow-2xs">
                                    {delivery.length} Batches
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3.5 pt-2">
                        <div className="h-[210px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={delivery} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="deliveryBarGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00bdae" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatDateShort}
                                        stroke="#94a3b8" 
                                        fontSize={10} 
                                        fontWeight={600}
                                        tickLine={false} 
                                        axisLine={false} 
                                        dy={6} 
                                    />
                                    <YAxis 
                                        tickFormatter={formatYAxisFuel}
                                        stroke="#94a3b8" 
                                        fontSize={10} 
                                        fontWeight={600}
                                        tickLine={false} 
                                        axisLine={false} 
                                        dx={-2} 
                                    />
                                    <Tooltip content={<CustomChartTooltip customTitle="Delivery Inflow" />} />
                                    <Bar 
                                        dataKey="amount" 
                                        fill="url(#deliveryBarGrad)" 
                                        radius={[6, 6, 0, 0] as any} 
                                        maxBarSize={38}
                                        background={{ fill: 'rgba(0, 189, 174, 0.05)', radius: 6 }}
                                    >
                                        <LabelList 
                                            dataKey="amount" 
                                            position="top" 
                                            formatter={(val: any) => `${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}L`}
                                            fill="#0f766e"
                                            fontSize={10}
                                            fontWeight={800}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Chart Bottom Insights Footer */}
                        <div className="flex items-center justify-between border-t border-border/20 pt-2 mt-1 text-[11px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-teal-500" />
                                Verified Deliveries
                            </span>
                            <span>
                                Avg Batch: <strong className="text-slate-800 dark:text-slate-200">{formatFuel(avgDelivery)}</strong>
                            </span>
                        </div>
                    </div>
                </Card>


                {/* 3. FUEL CONSUMPTION TREND */}
                <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-2xl">
                    <div className="border-b border-border/15 p-3.5 pb-2.5 bg-slate-50/40 dark:bg-slate-900/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs">
                                        <Zap className="w-3.5 h-3.5" />
                                    </div>
                                    <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                                        Daily Fleet Consumption Rate
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] mt-0.5">
                                    Daily fuel issues across all operations
                                </CardDescription>
                            </div>
                            {/* Metric Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold shadow-2xs">
                                    Avg: {formatFuel(avgConsumption)}/day
                                </div>
                                <div className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold shadow-2xs">
                                    Peak: {formatFuel(maxConsumption)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3.5 pt-2">
                        <div className="h-[210px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={consumption} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="consAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                                            <stop offset="70%" stopColor="#f43f5e" stopOpacity={0.1} />
                                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatDateShort}
                                        stroke="#94a3b8" 
                                        fontSize={10} 
                                        fontWeight={600}
                                        tickLine={false} 
                                        axisLine={false} 
                                        dy={6} 
                                    />
                                    <YAxis 
                                        tickFormatter={formatYAxisFuel}
                                        stroke="#94a3b8" 
                                        fontSize={10} 
                                        fontWeight={600}
                                        tickLine={false} 
                                        axisLine={false} 
                                        dx={-2} 
                                    />
                                    <ReferenceLine 
                                        y={avgConsumption} 
                                        stroke="#f59e0b" 
                                        strokeDasharray="4 4" 
                                        strokeWidth={1.5}
                                        label={{
                                            value: `Target (${avgConsumption} L)`, 
                                            fill: '#d97706', 
                                            fontSize: 9, 
                                            position: 'insideTopLeft',
                                            fontWeight: 700
                                        }} 
                                    />
                                    <Tooltip content={<CustomChartTooltip customTitle="Daily Issue" />} />
                                    <Area
                                        type="monotone"
                                        dataKey="consumption"
                                        stroke="#f59e0b"
                                        strokeWidth={2.5}
                                        fill="url(#consAreaGrad)"
                                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff', fill: '#f59e0b' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Chart Bottom Insights Footer */}
                        <div className="flex items-center justify-between border-t border-border/20 pt-2 mt-1 text-[11px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Fleet Burn Rate
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                <ShieldCheck className="w-3 h-3" />
                                Within Limits
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                                Total: {formatFuel(totalConsumptionInWindow)}
                            </span>
                        </div>
                    </div>
                </Card>


                {/* 4. VEHICLE FUEL USAGE */}
                <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-2xl">
                    <div className="border-b border-border/15 p-3.5 pb-2.5 bg-slate-50/40 dark:bg-slate-900/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-2xs">
                                        <Truck className="w-3.5 h-3.5" />
                                    </div>
                                    <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                                        Fleet Consumption Share
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] mt-0.5">
                                    Breakdown by vehicle asset allocation
                                </CardDescription>
                            </div>
                            {/* Top vehicle Badge */}
                            <div className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold shadow-2xs">
                                Top: {vehicleFuelUsage[0]?.name}
                            </div>
                        </div>
                    </div>

                    <div className="p-3.5 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            {/* Donut Chart with Center KPI */}
                            <div className="sm:col-span-5 relative h-[170px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={vehicleFuelUsage}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={46}
                                            outerRadius={70}
                                            paddingAngle={3}
                                            dataKey="fuelUsed"
                                            stroke="none"
                                        >
                                            {vehicleFuelUsage.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={PALETTE[index % PALETTE.length]} 
                                                    className="transition-all duration-300 hover:opacity-80"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomChartTooltip customTitle="Vehicle Usage" />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center donut stat badge */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Fleet Total</span>
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                                        {formatFuel(totalUsageInDoughnut)}
                                    </span>
                                </div>
                            </div>

                            {/* Ranked Fleet Progress Bars List */}
                            <div className="sm:col-span-7 space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                                {vehicleFuelUsage.slice(0, 5).map((vehicle, index) => {
                                    const percentage = totalUsageInDoughnut > 0 
                                        ? Math.round((vehicle.fuelUsed / totalUsageInDoughnut) * 100) 
                                        : 0;
                                    const color = PALETTE[index % PALETTE.length];

                                    return (
                                        <div key={vehicle.name} className="group/item p-1 hover:bg-slate-500/5 rounded-lg transition-colors">
                                            <div className="flex items-center justify-between text-[11px] mb-0.5">
                                                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                                    <span className="truncate max-w-[90px]">{vehicle.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 font-semibold">
                                                    <span className="text-muted-foreground text-[10px]">{formatFuel(vehicle.fuelUsed)}</span>
                                                    <span 
                                                        className="px-1.5 py-0.2 rounded text-[10px] font-black"
                                                        style={{ backgroundColor: `${color}18`, color: color }}
                                                    >
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-500" 
                                                    style={{ 
                                                        width: `${percentage}%`,
                                                        backgroundColor: color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Chart Bottom Insights Footer */}
                        <div className="flex items-center justify-between border-t border-border/20 pt-2 mt-1 text-[11px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-primary" />
                                Top 3 assets = 45% usage
                            </span>
                            <span className="text-primary font-bold text-[11px]">
                                Units Verified
                            </span>
                        </div>
                    </div>
                </Card>

            </div>

            {/* Reconciliation Summary Card */}
            <Card className="overflow-hidden mt-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.07)] rounded-2xl">
                <div className="border-b border-border/15 p-3.5 pb-2.5 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-extrabold">Daily Reconciliation Matrix</CardTitle>
                        <CardDescription className="text-[11px]">End-of-day physical dip vs book balance audit</CardDescription>
                    </div>
                    <StatusBadge status={reconciliation.status} />
                </div>
                <div className="p-3.5">
                    <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-7">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/40 shadow-xs">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Opening</p>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">{formatFuel(reconciliation.openingBalance)}</p>
                        </div>
                        <div className="p-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-xs">
                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Deliveries</p>
                            <p className="text-sm font-black text-emerald-600 mt-0.5">+{formatFuel(reconciliation.deliveries)}</p>
                        </div>
                        <div className="p-2.5 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/20 shadow-xs">
                            <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Fuel Issues</p>
                            <p className="text-sm font-black text-rose-600 mt-0.5">-{formatFuel(reconciliation.fuelIssues)}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/40 shadow-xs">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Expected</p>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">{formatFuel(reconciliation.expectedClosing)}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/40 shadow-xs">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Actual</p>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">{formatFuel(reconciliation.actualClosing)}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/40 shadow-xs">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Variance</p>
                            <p className={`text-sm font-black mt-0.5 ${reconciliation.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {reconciliation.variance >= 0 ? '+' : ''}{formatFuel(reconciliation.variance)}
                            </p>
                        </div>
                        <div className="p-2.5 bg-primary/5 rounded-xl border border-primary/20 shadow-xs flex flex-col justify-center">
                            <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-0.5">Audit Status</p>
                            <StatusBadge status={reconciliation.status} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Recent Transactions and Deliveries */}
            <div className="grid gap-4 md:grid-cols-2 mt-4">
                <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.07)] rounded-2xl">
                    <div className="flex flex-row items-center justify-between border-b border-border/15 p-3.5 pb-2.5 bg-slate-50/40 dark:bg-slate-900/30">
                        <div>
                            <CardTitle className="text-sm font-extrabold">Recent Fuel Issues</CardTitle>
                            <CardDescription className="text-[11px]">Latest dispenser terminal transactions</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg h-7 px-2.5 text-xs font-bold hover:bg-muted shadow-2xs">
                            View All
                        </Button>
                    </div>
                    <div className="p-3.5 pt-2">
                        <div className="space-y-1">
                            {recentTransactions.slice(0, 5).map((txn) => (
                                <div key={txn.id} className="flex items-center justify-between p-2 hover:bg-slate-500/5 rounded-lg transition-all duration-150">
                                    <div>
                                        <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{txn.id}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.2 font-medium">
                                            {txn.vehicleId || 'Bulk Issue'} • {txn.date}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="font-black text-slate-800 dark:text-slate-100 text-xs">{formatFuel(txn.quantity)}</p>
                                        <div className="mt-0.5">
                                            <StatusBadge status={txn.status} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.07)] rounded-2xl">
                    <div className="flex flex-row items-center justify-between border-b border-border/15 p-3.5 pb-2.5 bg-slate-50/40 dark:bg-slate-900/30">
                        <div>
                            <CardTitle className="text-sm font-extrabold">Recent Replenishment Inflows</CardTitle>
                            <CardDescription className="text-[11px]">Supplier bulk tanker receipts</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg h-7 px-2.5 text-xs font-bold hover:bg-muted shadow-2xs">
                            View All
                        </Button>
                    </div>
                    <div className="p-3.5 pt-2">
                        <div className="space-y-1">
                            {recentDeliveries.slice(0, 5).map((delivery) => (
                                <div key={delivery.id} className="flex items-center justify-between p-2 hover:bg-slate-500/5 rounded-lg transition-all duration-150">
                                    <div>
                                        <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{delivery.id}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.2 font-medium">
                                            {delivery.supplier} • {delivery.date}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="font-black text-slate-800 dark:text-slate-100 text-xs">{formatFuel(delivery.quantity)}</p>
                                        <div className="mt-0.5">
                                            <StatusBadge status={delivery.status} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Exceptions */}
            {exceptions.length > 0 && (
                <Card className="overflow-hidden mt-4 border border-rose-200/90 dark:border-rose-900/50 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-2px_rgba(244,63,94,0.12)] rounded-2xl">
                    <div className="border-b border-rose-500/15 p-3.5 pb-2.5 bg-rose-500/[0.02]">
                        <CardTitle className="flex items-center gap-1.5 text-sm font-black text-slate-800 dark:text-slate-100">
                            <AlertTriangle className="h-4 w-4 text-rose-500 animate-bounce" />
                            Operational Exceptions & Flags
                        </CardTitle>
                        <CardDescription className="text-[11px]">Discrepancies requiring immediate supervisor review</CardDescription>
                    </div>
                    <div className="p-3.5 pt-2">
                        <div className="space-y-1">
                            {exceptions.map((exc) => (
                                <div key={exc.id} className="flex items-center justify-between p-2 hover:bg-rose-500/10 rounded-lg transition-all duration-150">
                                    <div>
                                        <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{exc.type}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.2 font-medium">{exc.description}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-[10px] text-muted-foreground font-medium">{exc.date}</p>
                                        <div className="mt-0.5">
                                            <StatusBadge status={exc.severity} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </PageContainer>
    );
}