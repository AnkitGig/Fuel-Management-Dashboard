// src/app/reconciliation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Download, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { reconciliationService } from '@/services/reconciliationService';
import { authService } from '@/lib/auth';
import { formatFuel, formatNumber, getStatusColor } from '@/lib/utils';
import { Reconciliation } from '@/types/reconciliation';

export default function ReconciliationPage() {
    const router = useRouter();
    const [records, setRecords] = useState<Reconciliation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [summary, setSummary] = useState({
        openingBalance: 0,
        deliveries: 0,
        fuelIssues: 0,
        expectedClosing: 0,
        actualClosing: 0,
        variance: 0,
        status: 'Reconciled' as const,
    });

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await authService.isAuthenticated();
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            loadData();
            loadSummary();
        };
        checkAuth();
    }, [router, page]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await reconciliationService.getReconciliationRecords({
                page,
                pageSize,
                status: selectedStatus || undefined,
            });
            setRecords(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to load reconciliation records');
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const data = await reconciliationService.getReconciliationSummary();
            setSummary(data);
        } catch {
            // Ignore
        }
    };

    if (loading && records.length === 0) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Reconciliation</h1>
                    <p className="text-muted-foreground">Daily fuel reconciliation and variance tracking</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Latest Reconciliation Summary</CardTitle>
                    <CardDescription>Today's fuel reconciliation status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-7">
                        <div>
                            <p className="text-sm text-muted-foreground">Opening Balance</p>
                            <p className="text-lg font-semibold">{formatFuel(summary.openingBalance)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Deliveries</p>
                            <p className="text-lg font-semibold text-green-600">+{formatFuel(summary.deliveries)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fuel Issues</p>
                            <p className="text-lg font-semibold text-red-600">-{formatFuel(summary.fuelIssues)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Expected Closing</p>
                            <p className="text-lg font-semibold">{formatFuel(summary.expectedClosing)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Actual Closing</p>
                            <p className="text-lg font-semibold">{formatFuel(summary.actualClosing)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Variance</p>
                            <p className={`text-lg font-semibold ${summary.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {summary.variance >= 0 ? '+' : ''}{formatFuel(summary.variance)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <StatusBadge status={summary.status} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Historical Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Historical Reconciliation</CardTitle>
                    <CardDescription>Daily reconciliation records</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">All Statuses</option>
                            <option value="Reconciled">Reconciled</option>
                            <option value="Warning">Warning</option>
                            <option value="Exception">Exception</option>
                        </select>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium">Date</th>
                                    <th className="text-left p-3 font-medium">Opening Balance</th>
                                    <th className="text-left p-3 font-medium">Deliveries</th>
                                    <th className="text-left p-3 font-medium">Fuel Issues</th>
                                    <th className="text-left p-3 font-medium">Expected Closing</th>
                                    <th className="text-left p-3 font-medium">Actual Closing</th>
                                    <th className="text-left p-3 font-medium">Variance</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-4 text-center text-muted-foreground">
                                            No reconciliation records found
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 font-medium">{record.date}</td>
                                            <td className="p-3">{formatFuel(record.openingBalance)}</td>
                                            <td className="p-3 text-green-600">+{formatFuel(record.deliveries)}</td>
                                            <td className="p-3 text-red-600">-{formatFuel(record.fuelIssues)}</td>
                                            <td className="p-3">{formatFuel(record.expectedClosing)}</td>
                                            <td className="p-3">{formatFuel(record.actualClosing)}</td>
                                            <td className={`p-3 font-semibold ${record.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {record.variance >= 0 ? '+' : ''}{formatFuel(record.variance)}
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge status={record.status} />
                                            </td>
                                            <td className="p-3">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {records.length} of {total} records
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 text-sm">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </PageContainer>
    );
}