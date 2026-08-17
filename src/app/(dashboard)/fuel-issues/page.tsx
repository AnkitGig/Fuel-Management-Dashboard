// src/app/fuel-issues/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Download, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { fuelIssueService } from '@/services/fuelIssueService';
import { vehicleService } from '@/services/vehicleService';
import { authService } from '@/lib/auth';
import { formatFuel, getStatusColor } from '@/lib/utils';
import { FuelIssue } from '@/types/fuel';

export default function FuelIssuesPage() {
    const router = useRouter();
    const [issues, setIssues] = useState<FuelIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [vehicles, setVehicles] = useState<string[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await authService.isAuthenticated();
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            loadData();
            loadVehicles();
        };
        checkAuth();
    }, [router, page]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fuelIssueService.getFuelIssues({
                page,
                pageSize,
                search: search || undefined,
                status: selectedStatus || undefined,
                vehicleId: selectedVehicle || undefined,
            });
            setIssues(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to load fuel issues');
        } finally {
            setLoading(false);
        }
    };

    const loadVehicles = async () => {
        try {
            const response = await vehicleService.getVehicles({ pageSize: 100 });
            setVehicles(response.data.map(v => v.vehicleId));
        } catch {
            // Ignore
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadData();
    };

    if (loading && issues.length === 0) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Fuel Issues</h1>
                    <p className="text-muted-foreground">Track fuel dispensing and transactions</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>Complete list of fuel transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by ID, vehicle..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">All Statuses</option>
                            <option value="Matched">Matched</option>
                            <option value="Unmatched">Unmatched</option>
                            <option value="Exception">Exception</option>
                        </select>
                        <select
                            value={selectedVehicle}
                            onChange={(e) => {
                                setSelectedVehicle(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">All Vehicles</option>
                            {vehicles.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                        <Button onClick={handleSearch} size="sm">Search</Button>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium">Transaction ID</th>
                                    <th className="text-left p-3 font-medium">Date</th>
                                    <th className="text-left p-3 font-medium">Time</th>
                                    <th className="text-left p-3 font-medium">Vehicle ID</th>
                                    <th className="text-left p-3 font-medium">Fuel Quantity</th>
                                    <th className="text-left p-3 font-medium">Asset Type</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-4 text-center text-muted-foreground">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    issues.map((issue) => (
                                        <tr key={issue.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 font-medium">{issue.transactionId}</td>
                                            <td className="p-3">{issue.date}</td>
                                            <td className="p-3">{issue.time}</td>
                                            <td className="p-3">{issue.vehicleId}</td>
                                            <td className="p-3 font-medium">{formatFuel(issue.fuelQuantity)}</td>
                                            <td className="p-3">{issue.assetType}</td>
                                            <td className="p-3">
                                                <StatusBadge status={issue.status} />
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
                                Showing {issues.length} of {total} transactions
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