// src/app/(dashboard)/layout.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen md:min-h-[111.2vh]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}