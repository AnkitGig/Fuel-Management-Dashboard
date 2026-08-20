// src/app/admin/roles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
            <div className="space-y-6">
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

                <div className="grid gap-6 md:grid-cols-3">
                    {roleData.map((role) => {
                        let headerBg = 'bg-slate-500'; // default Viewer
                        if (role.role === 'Administrator') {
                            headerBg = 'bg-[#02172e]';
                        } else if (role.role === 'Manager') {
                            headerBg = 'bg-[#00c0b5]';
                        }

                        return (
                            <Card key={role.role} className="overflow-hidden border border-slate-200 shadow-sm rounded-none">
                                <div className={`${headerBg} px-5 py-4 text-white`}>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold tracking-tight">{role.role}</h2>
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#137333]" />
                                            Active
                                        </span>
                                    </div>
                                </div>
                                <CardContent className="p-5 bg-gradient-to-b from-white to-[#f0fdfa]">
                                    <p className="text-xs text-slate-500 mb-4">{role.description}</p>
                                    <div className="space-y-2">
                                        {Object.entries(role.permissions).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                                                <span className="text-sm text-slate-700 font-medium">{permissionLabels[key] || key}</span>
                                                <span className={`text-sm font-semibold ${value ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {value ? '✓' : '—'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-none">
                    <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle>Permission Matrix</CardTitle>
                        <CardDescription>Detailed view of all role permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pb-6">
                        <div className="overflow-x-auto border-t border-slate-200">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr>
                                        <th className="bg-[#02172e] text-white py-3 px-6 text-left font-semibold border-r border-[#00c0b5]/20">Resource</th>
                                        {roleData.map((role, idx) => {
                                            const headerBg = idx === roleData.length - 1 ? 'bg-slate-500' : (role.role === 'Administrator' ? 'bg-[#02172e]' : 'bg-[#00c0b5]');
                                            return (
                                                <th
                                                    key={role.role}
                                                    className={`${headerBg} text-white py-3 px-6 text-center font-semibold border-r border-[#00c0b5]/20 last:border-r-0`}
                                                >
                                                    {role.role}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(permissionLabels).map((key) => (
                                        <tr key={key} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-6 font-medium text-slate-700 border-r border-slate-200">{permissionLabels[key]}</td>
                                            {roleData.map((role) => {
                                                const hasPerm = role.permissions[key as keyof typeof role.permissions];
                                                return (
                                                    <td key={role.role} className="text-center py-3 px-6 align-middle border-r border-slate-200 last:border-r-0">
                                                        {hasPerm ? (
                                                            <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 mx-auto" />
                                                        ) : null}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}