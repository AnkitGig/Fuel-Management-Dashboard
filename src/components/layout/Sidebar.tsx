// src/components/layout/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Fuel,
    Truck,
    FileText,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Droplet,
    ClipboardList,
    FileBarChart,
    UserCog,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService, hasPermission } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';

const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Fuel Levels', href: '/fuel-levels', icon: Droplet },
    { name: 'Deliveries', href: '/deliveries', icon: Truck },
    { name: 'Fuel Issues', href: '/fuel-issues', icon: Fuel },
    { name: 'Vehicles', href: '/vehicles', icon: Truck },
    { name: 'Reconciliation', href: '/reconciliation', icon: ClipboardList },
    { name: 'Reports', href: '/reports', icon: FileBarChart },
];

const adminItems = [
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Roles', href: '/admin/roles', icon: UserCog },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const { isOpen, toggle, setOpen, isMobile } = useSidebar();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (isMobile) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [isMobile, setOpen]);

    const handleLogout = async () => {
        await authService.logout();
        window.location.href = '/login';
    };

    const sidebarContent = (
        <div className="flex h-full flex-col bg-background border-r">
            <div className="flex h-16 items-center justify-between px-4 border-b">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">FM</span>
                    </div>
                    {!isCollapsed && (
                        <span className="font-semibold text-lg">Fuel Manager</span>
                    )}
                </Link>
                {!isMobile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="h-8 w-8 p-0"
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                )}
                {isMobile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {navigationItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent hover:text-accent-foreground',
                                isCollapsed && 'justify-center px-2'
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}

                {user?.role === 'Administrator' && (
                    <>
                        <div className="px-3 py-2">
                            <div className="h-px bg-border" />
                        </div>
                        {adminItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-accent hover:text-accent-foreground',
                                        isCollapsed && 'justify-center px-2'
                                    )}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            <div className="border-t p-4 space-y-2">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.role || 'Viewer'}</p>
                        </div>
                    </div>
                )}
                <Button
                    variant="ghost"
                    className={cn(
                        'w-full justify-start text-muted-foreground hover:text-foreground',
                        isCollapsed && 'justify-center px-2'
                    )}
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="ml-2">Logout</span>}
                </Button>
            </div>
        </div>
    );

    // Mobile drawer
    if (isMobile) {
        return (
            <>
                {isOpen && (
                    <div
                        className="fixed inset-0 z-50 bg-black/50"
                        onClick={() => setOpen(false)}
                    />
                )}
                <div
                    className={cn(
                        'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out',
                        isOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    {sidebarContent}
                </div>
            </>
        );
    }

    // Desktop sidebar
    return (
        <div
            className={cn(
                'hidden md:block border-r bg-background transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-72'
            )}
        >
            {sidebarContent}
        </div>
    );
}