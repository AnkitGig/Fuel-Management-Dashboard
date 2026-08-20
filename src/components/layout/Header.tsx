// src/components/layout/Header.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/useSidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { useClientStore, CLIENTS } from '@/services/api';

export function Header() {
    const pathname = usePathname();
    const { toggle, isOpen } = useSidebar();
    const { selectedClient, selectClient } = useClientStore();

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-[#f26522]/15 bg-[#001b33] text-white px-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggle}
                    className="md:hidden rounded-lg text-white hover:bg-white/10"
                >
                    <Menu className="h-5 w-5 text-white" />
                </Button>
                <Breadcrumbs />
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#001529] border border-[#f26522]/30 rounded-lg px-3 py-1.5 shadow-sm">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Client:</span>
                    <select
                        value={selectedClient.name}
                        onChange={(e) => {
                            const client = CLIENTS.find(c => c.name === e.target.value);
                            if (client) selectClient(client);
                        }}
                        className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer pr-2 select-none"
                    >
                        {CLIENTS.map((client) => (
                            <option key={client.name} value={client.name} className="bg-[#001b33] text-white">
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </header>
    );
}
