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
    Trash2,
    RotateCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { userService } from '@/services/userService';
import { authService, hasPermission, PERMISSIONS } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                    <p className="text-slate-500 text-sm">Manage system users and access</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        className="inline-flex items-center justify-center rounded-none border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    {hasPermission(currentUser, PERMISSIONS.USERS.MANAGE) && (
                        <button
                            className="inline-flex items-center justify-center rounded-none bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors gap-2"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add User
                        </button>
                    )}
                </div>
            </div>

            <Card className="border border-slate-200 shadow-xs rounded-none">
                <CardHeader className="pb-3 px-6">
                    <CardTitle className="text-xl font-bold text-slate-800">All Users</CardTitle>
                    <CardDescription className="text-slate-500">Complete list of system users</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-6">
                    <div className="flex flex-col sm:flex-row gap-2 mb-6 px-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full rounded-none border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#138024] focus:border-[#138024] shadow-xs"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="inline-flex items-center justify-center rounded-none bg-[#00c0b5] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f631c] transition-colors"
                        >
                            Search
                        </button>
                        <button
                            className="inline-flex items-center justify-center rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors gap-2 shadow-xs"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>

                    <div className="overflow-x-auto border-y border-slate-200 shadow-xs">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Name</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Email</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Role</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Status</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Last Login</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold border-r border-white/20 last:border-r-0">Created Date</th>
                                    <th className="bg-primary text-white py-2 px-3 text-left font-semibold last:border-r-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400 bg-slate-50">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="py-2 px-3 font-semibold text-slate-800 align-middle border-r border-slate-200">{user.name}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{user.email}</td>
                                            <td className="py-2 px-3 align-middle border-r border-slate-200">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">
                                                    <span className="text-blue-500 font-bold">•</span> {user.role}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 align-middle border-r border-slate-200">
                                                {user.status === 'Active' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 border border-green-200 text-green-700">
                                                        <span className="text-green-500 font-bold">•</span> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-700">
                                                        <span className="text-slate-400 font-bold">•</span> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{user.lastLogin || 'Never'}</td>
                                            <td className="py-2 px-3 text-slate-600 align-middle border-r border-slate-200">{formatDate(user.createdAt)}</td>
                                            <td className="py-2 px-3 align-middle">
                                                <div className="flex gap-2 justify-start">
                                                    <button
                                                        title="View Details"
                                                        className="p-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    {hasPermission(currentUser, PERMISSIONS.USERS.MANAGE) && (
                                                        <>
                                                            <button
                                                                title="Edit User"
                                                                className="p-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                title={user.status === 'Active' ? 'Deactivate User' : 'Reactivate User'}
                                                                onClick={() => handleToggleStatus(user.id, user.status)}
                                                                className="p-1 rounded hover:bg-slate-100 transition-colors"
                                                            >
                                                                {user.status === 'Active' ? (
                                                                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                                                                ) : (
                                                                    <RotateCw className="h-4 w-4 text-green-600 hover:text-green-800" />
                                                                )}
                                                            </button>
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
                        <div className="flex items-center justify-between mt-4 px-6">
                            <p className="text-sm text-slate-500">
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
                                <span className="flex items-center px-3 text-sm text-slate-600 font-medium">
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