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
import { formatFuel, formatNumber, getStatusColor } from '@/lib/utils';
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Real-time fuel management overview
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={dateRange === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDateRange('week')}
                    >
                        7D
                    </Button>
                    <Button
                        variant={dateRange === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDateRange('month')}
                    >
                        30D
                    </Button>
                    <Button
                        variant={dateRange === 'quarter' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDateRange('quarter')}
                    >
                        90D
                    </Button>
                    <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Custom
                    </Button>
                </div>
            </div>

            {/* Tank Status Card */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Fuel Level</CardTitle>
                        <Droplet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatFuel(tankStatus.currentLevel)}</div>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                                Capacity: {formatFuel(tankStatus.capacity)}
                            </p>
                            <span className={getStatusColor(tankStatus.status)}>
                                {tankStatus.percentage}%
                            </span>
                        </div>
                        <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                            <div
                                className="h-2 rounded-full bg-primary transition-all"
                                style={{ width: `${tankStatus.percentage}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fuel Delivered</CardTitle>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatFuel(kpiData.fuelDelivered)}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fuel Issued</CardTitle>
                        <ArrowDown className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatFuel(kpiData.fuelIssued)}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpiData.vehicles}</div>
                        <p className="text-xs text-muted-foreground">Active assets</p>
                    </CardContent>
                </Card>
            </div>

            {/* Second row of KPI cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpiData.transactions}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reconciliation</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            <StatusBadge status={kpiData.reconciliationStatus} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Variance: {formatFuel(kpiData.variance)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Consumption</CardTitle>
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatFuel(kpiData.currentConsumption)}</div>
                        <p className="text-xs text-muted-foreground">Per day average</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Exceptions</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{exceptions.length}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Fuel Level Trend</CardTitle>
                        <CardDescription>Historical fuel levels over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={fuelLevelTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [`${formatFuel(Number(value))}`, 'Fuel Level']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="level"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Fuel Delivery Trend</CardTitle>
                        <CardDescription>Deliveries over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deliveryTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [`${formatFuel(Number(value))}`, 'Delivery']}
                                    />
                                    <Bar dataKey="amount" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Fuel Consumption Trend</CardTitle>
                        <CardDescription>Daily fuel consumption</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={consumptionTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [`${formatFuel(Number(value))}`, 'Consumption']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="consumption"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Fuel Usage</CardTitle>
                        <CardDescription>Top vehicles by fuel consumption</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={vehicleFuelUsage}
                                        dataKey="fuelUsed"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                    >
                                        {vehicleFuelUsage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${formatFuel(Number(value))}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reconciliation Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Reconciliation Summary</CardTitle>
                    <CardDescription>Today's fuel reconciliation status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-7">
                        <div>
                            <p className="text-sm text-muted-foreground">Opening Balance</p>
                            <p className="text-lg font-semibold">{formatFuel(reconciliationSummary.openingBalance)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Deliveries</p>
                            <p className="text-lg font-semibold text-green-600">+{formatFuel(reconciliationSummary.deliveries)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fuel Issues</p>
                            <p className="text-lg font-semibold text-red-600">-{formatFuel(reconciliationSummary.fuelIssues)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Expected Closing</p>
                            <p className="text-lg font-semibold">{formatFuel(reconciliationSummary.expectedClosing)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Actual Closing</p>
                            <p className="text-lg font-semibold">{formatFuel(reconciliationSummary.actualClosing)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Variance</p>
                            <p className={`text-lg font-semibold ${reconciliationSummary.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {reconciliationSummary.variance >= 0 ? '+' : ''}{formatFuel(reconciliationSummary.variance)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <StatusBadge status={reconciliationSummary.status} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions and Deliveries */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest fuel transactions</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentTransactions.slice(0, 5).map((txn) => (
                                <div key={txn.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium">{txn.id}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {txn.vehicleId || 'Delivery'} • {txn.date}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatFuel(txn.quantity)}</p>
                                        <StatusBadge status={txn.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Deliveries</CardTitle>
                            <CardDescription>Latest fuel deliveries</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentDeliveries.slice(0, 5).map((delivery) => (
                                <div key={delivery.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium">{delivery.id}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {delivery.supplier} • {delivery.date}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatFuel(delivery.quantity)}</p>
                                        <StatusBadge status={delivery.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Exceptions */}
            {exceptions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Exceptions & Alerts
                        </CardTitle>
                        <CardDescription>Items requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {exceptions.map((exc) => (
                                <div key={exc.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium">{exc.type}</p>
                                        <p className="text-sm text-muted-foreground">{exc.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">{exc.date}</p>
                                        <StatusBadge status={exc.severity} />
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