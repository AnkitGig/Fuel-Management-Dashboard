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
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                className="md:hidden"
            >
                <Menu className="h-5 w-5" />
            </Button>
            <Breadcrumbs />
        </header>
    );
}