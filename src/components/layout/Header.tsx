// src/components/layout/Header.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/useSidebar';
import { Breadcrumbs } from './Breadcrumbs';

export function Header() {
    const pathname = usePathname();
    const { toggle, isOpen } = useSidebar();

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-[#00c0b5]/15 bg-[#02172e] text-white px-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                className="md:hidden rounded-lg text-white hover:bg-white/10"
            >
                <Menu className="h-5 w-5 text-white" />
            </Button>
            <Breadcrumbs />
        </header>
    );
}