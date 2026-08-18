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
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/40 bg-background/60 backdrop-blur-md px-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                className="md:hidden rounded-lg"
            >
                <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Breadcrumbs />
        </header>
    );
}