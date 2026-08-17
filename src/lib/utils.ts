// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(amount: number): string {
  return `$${formatNumber(amount, 2)}`;
}

export function formatFuel(amount: number): string {
  return `${formatNumber(amount, 1)} L`;
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    'Normal': 'bg-green-100 text-green-800',
    'Reconciled': 'bg-green-100 text-green-800',
    'Matched': 'bg-green-100 text-green-800',
    'Active': 'bg-green-100 text-green-800',
    'Warning': 'bg-yellow-100 text-yellow-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Exception': 'bg-red-100 text-red-800',
    'Unmatched': 'bg-red-100 text-red-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-gray-100 text-gray-800',
    'Completed': 'bg-blue-100 text-blue-800',
    'Information': 'bg-blue-100 text-blue-800',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    'Normal': 'CheckCircle',
    'Reconciled': 'CheckCircle',
    'Matched': 'CheckCircle',
    'Active': 'CheckCircle',
    'Warning': 'AlertTriangle',
    'Pending': 'Clock',
    'Exception': 'XCircle',
    'Unmatched': 'XCircle',
    'Inactive': 'MinusCircle',
  };
  return iconMap[status] || 'Circle';
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}