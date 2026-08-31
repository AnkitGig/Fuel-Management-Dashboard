// src/components/layout/Header.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Menu, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/useSidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { useClientStore, CLIENTS } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
    const pathname = usePathname();
    const { toggle, isOpen } = useSidebar();
    const { selectedClient, selectClient } = useClientStore();
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 bg-gradient-to-r from-[#f26522] to-[#e25c00] text-white px-6 shadow-md">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggle}
                    className="rounded-lg text-white bg-white/10 hover:bg-white/20 border border-white/10 h-9 w-9 p-0 flex items-center justify-center transition-colors duration-200"
                >
                    <Menu className="h-5 w-5 text-white" />
                </Button>
            </div>

            <div className="flex items-center gap-4">
                {/* Client Dropdown selector */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-white/80 tracking-wider">CLIENT:</span>
                    <div className="relative bg-white rounded-lg px-3 py-1.5 shadow-sm flex items-center min-w-[140px]">
                        <select
                            value={selectedClient.name}
                            onChange={(e) => {
                                const client = CLIENTS.find(c => c.name === e.target.value);
                                if (client) selectClient(client);
                            }}
                            className="w-full bg-transparent text-xs font-bold text-zinc-800 focus:outline-none cursor-pointer pr-4 appearance-none select-none"
                        >
                            {CLIENTS.map((client) => (
                                <option key={client.name} value={client.name} className="bg-white text-zinc-800">
                                    {client.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 pointer-events-none text-zinc-500 h-3.5 w-3.5" />
                    </div>
                </div>

                {/* User badge */}
                <div className="flex items-center gap-2.5 pl-4 border-l border-white/20">
                    <div className="h-9 w-9 rounded-full bg-white text-[#f26522] flex items-center justify-center font-extrabold shadow-sm text-sm shrink-0">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="hidden sm:flex flex-col text-left leading-tight">
                        <span className="text-xs font-bold text-white">{user?.name || 'Admin User'}</span>
                        <span className="text-[10px] text-white/85 font-medium">{user?.role || 'Administrator'}</span>
                    </div>
                    <ChevronDown className="text-white/80 h-3.5 w-3.5 cursor-pointer" />
                </div>
            </div>
        </header>
    );
}
