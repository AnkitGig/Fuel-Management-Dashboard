// src/components/common/StatusBadge.tsx
import { cn } from '@/lib/utils';
import { getStatusColor } from '@/lib/utils';
import { Status } from '@/types/common';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            getStatusColor(status),
            className
        )}>
            {status}
        </span>
    );
}