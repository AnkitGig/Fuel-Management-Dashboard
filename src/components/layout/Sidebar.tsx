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
    Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';

const navigationItems = [
    { name: 'Fuel Levels', href: '/fuel-levels', icon: Droplet },
    { name: 'Deliveries', href: '/deliveries', icon: Truck },
    { name: 'Transactions', href: '/fuel-issues', icon: Fuel },
    { name: 'Fuel Efficiency', href: '/vehicles', icon: Truck },
    { name: 'Fuel Efficiency Summary', href: '/fuel-efficiency-summary', icon: FileBarChart },
    { name: 'Fuel Limits', href: '/fuel-limits', icon: Sliders },
    { name: 'Reconciliation', href: '/reconciliation', icon: ClipboardList },
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
        <div className="flex h-full flex-col bg-[#02172e] text-slate-300 border-r border-[#00c0b5]/15">
            <div className="flex h-16 items-center justify-between px-6 border-b border-[#00c0b5]/10">
                <Link href="/fuel-levels" className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00bdae] to-[#009b8f] flex items-center justify-center shadow-lg shadow-teal-500/25">
                        <span className="text-white font-bold text-sm tracking-wider">FM</span>
                    </div>
                    {!isCollapsed && (
                        <span className="font-extrabold text-lg tracking-tight text-white">
                            Fuel Manager
                        </span>
                    )}
                </Link>
                {!isMobile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="h-8 w-8 p-0 rounded-lg hover:bg-muted/80 text-white hover:text-[#00c0b5]"
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                )}
                {isMobile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="h-8 w-8 p-0 rounded-lg text-white"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
 
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navigationItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-[#00c0b5] text-white shadow-md shadow-teal-500/25'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                                isCollapsed && 'justify-center px-2'
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
 
                {user?.role === 'Administrator' && (
                    <>
                        <div className="px-3 py-2">
                            <div className="h-px bg-white/10" />
                        </div>
                        {adminItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-[#00c0b5] text-white shadow-md shadow-teal-500/25'
                                            : 'text-slate-300 hover:bg-white/5 hover:text-white',
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
 
            <div className="border-t border-white/10 p-4 space-y-3">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-300 flex items-center justify-center border border-teal-500/20 shadow-xs">
                            <span className="text-teal-400 font-semibold text-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-400 font-medium truncate">{user?.role || 'Viewer'}</p>
                        </div>
                    </div>
                )}
                <Button
                    variant="ghost"
                    className={cn(
                        'w-full justify-start text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200',
                        isCollapsed && 'justify-center px-2'
                    )}
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="ml-2 font-medium">Logout</span>}
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
                'hidden md:block border-r bg-background transition-all duration-300 h-[111.2vh] sticky top-0',
                isCollapsed ? 'w-16' : 'w-72'
            )}
        >
            {sidebarContent}
        </div>
    );
}
