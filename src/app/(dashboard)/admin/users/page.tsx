// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Download,
    AlertTriangle,
    RefreshCw,
    Eye,
    Edit,
    UserPlus,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { userService } from '@/services/userService';
import { authService, hasPermission, PERMISSIONS } from '@/lib/auth';
import { formatDate, getStatusColor } from '@/lib/utils';
import { User } from '@/types/common';

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await authService.isAuthenticated();
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            if (!hasPermission(user, PERMISSIONS.USERS.VIEW)) {
                router.push('/dashboard');
                return;
            }
            loadData();
        };
        checkAuth();
    }, [router, page]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await userService.getUsers({
                page,
                pageSize,
                search: search || undefined,
            });
            setUsers(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadData();
    };

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            await userService.updateUser(userId, { status: newStatus as 'Active' | 'Inactive' });
            loadData();
        } catch {
            setError('Failed to update user status');
        }
    };

    if (loading && users.length === 0) {
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
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system users and access</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadData} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    {hasPermission(currentUser, PERMISSIONS.USERS.MANAGE) && (
                        <Button size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Complete list of system users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
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
                                    <th className="text-left p-3 font-medium">Name</th>
                                    <th className="text-left p-3 font-medium">Email</th>
                                    <th className="text-left p-3 font-medium">Role</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Last Login</th>
                                    <th className="text-left p-3 font-medium">Created Date</th>
                                    <th className="text-left p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 font-medium">{user.name}</td>
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3">
                                                <StatusBadge status={user.role} />
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge status={user.status} />
                                            </td>
                                            <td className="p-3">{user.lastLogin || 'Never'}</td>
                                            <td className="p-3">{formatDate(user.createdAt)}</td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {hasPermission(currentUser, PERMISSIONS.USERS.MANAGE) && (
                                                        <>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleToggleStatus(user.id, user.status)}
                                                            >
                                                                {user.status === 'Active' ? (
                                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                                )}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
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
                                Showing {users.length} of {total} users
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