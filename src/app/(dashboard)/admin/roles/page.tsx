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

            <Card>
                <CardHeader>
                    <CardTitle>Permission Matrix</CardTitle>
                    <CardDescription>Detailed view of all role permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium">Resource</th>
                                    {roleData.map(role => (
                                        <th key={role.role} className="text-center p-3 font-medium">{role.role}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(permissionLabels).map((key) => (
                                    <tr key={key} className="border-b hover:bg-muted/50">
                                        <td className="p-3 font-medium">{permissionLabels[key]}</td>
                                        {roleData.map(role => (
                                            <td key={role.role} className="text-center p-3">
                                                <span className={`inline-block h-4 w-4 rounded-full ${role.permissions[key as keyof typeof role.permissions] ? 'bg-green-500' : 'bg-gray-300'}`} />
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