// src/app/admin/roles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { authService, hasPermission, PERMISSIONS } from '@/lib/auth';

const roleData = [
    {
        role: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: {
            dashboard: true,
            fuelLevels: true,
            deliveries: true,
            fuelIssues: true,
            vehicles: true,
            reconciliation: true,
            reports: true,
            users: true,
            roles: true,
        },
    },
    {
        role: 'Manager',
        description: 'Operational access without user management',
        permissions: {
            dashboard: true,
            fuelLevels: true,
            deliveries: true,
            fuelIssues: true,
            vehicles: true,
            reconciliation: true,
            reports: true,
            users: false,
            roles: false,
        },
    },
    {
        role: 'Viewer',
        description: 'Read-only access to all operational data',
        permissions: {
            dashboard: true,
            fuelLevels: true,
            deliveries: true,
            fuelIssues: true,
            vehicles: true,
            reconciliation: true,
            reports: true,
            users: false,
            roles: false,
        },
    },
];

const permissionLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    fuelLevels: 'Fuel Levels',
    deliveries: 'Deliveries',
    fuelIssues: 'Fuel Issues',
    vehicles: 'Vehicles',
    reconciliation: 'Reconciliation',
    reports: 'Reports',
    users: 'Users',
    roles: 'Roles',
};

export default function RolesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await authService.isAuthenticated();
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            const user = await authService.getCurrentUser();
            if (!hasPermission(user, PERMISSIONS.ROLES.VIEW)) {
                router.push('/dashboard');
                return;
            }
            setLoading(false);
        };
        checkAuth();
    }, [router]);

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
                    <Button onClick={() => setError(null)}>Try Again</Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground">Manage role-based access control</p>
                </div>
                <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roleData.map((role) => (
                    <Card key={role.role}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {role.role}
                                <StatusBadge status={role.role === 'Administrator' ? 'Active' : 'Active'} />
                            </CardTitle>
                            <CardDescription>{role.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(role.permissions).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between py-1 border-b last:border-0">
                                        <span className="text-sm">{permissionLabels[key] || key}</span>
                                        <span className={`text-sm font-medium ${value ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {value ? '✓' : '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="rounded-none border border-slate-200 shadow-xs">
                <CardHeader className="pb-3 px-6">
                    <CardTitle>Permission Matrix</CardTitle>
                    <CardDescription>Detailed view of all role permissions</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-6">
                    <div className="overflow-x-auto border-y border-slate-200 shadow-xs">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-[#ff6600] text-white p-3 text-left font-semibold border-r border-white/25">Resource</th>
                                    {roleData.map((role, idx) => (
                                        <th 
                                            key={role.role} 
                                            className={`${
                                                idx === roleData.length - 1 ? 'bg-[#5a5a5a]' : 'bg-[#138024]'
                                            } text-white p-3 text-center font-semibold border-r border-white/25 last:border-r-0`}
                                        >
                                            {role.role}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(permissionLabels).map((key) => (
                                    <tr key={key} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="p-3 font-semibold text-slate-800 align-middle border-r border-slate-200">{permissionLabels[key]}</td>
                                        {roleData.map((role, idx) => (
                                            <td key={role.role} className="text-center p-3 align-middle border-r border-slate-200 last:border-r-0">
                                                <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
                                                    role.permissions[key as keyof typeof role.permissions] 
                                                        ? 'bg-green-100 text-green-700 font-bold' 
                                                        : 'bg-slate-100 text-slate-400 font-normal'
                                                }`}>
                                                    {role.permissions[key as keyof typeof role.permissions] ? '✓' : '—'}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </PageContainer>
    );
}