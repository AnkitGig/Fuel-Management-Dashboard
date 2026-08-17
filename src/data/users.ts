// src/data/users.ts
import { User } from '@/types/common';
import { generateId } from '@/lib/utils';

export const mockUsers: User[] = [
  { id: generateId(), name: 'Admin User', email: 'admin@example.com', role: 'Administrator', status: 'Active', lastLogin: '2026-08-12 08:30:00', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: generateId(), name: 'Manager User', email: 'manager@example.com', role: 'Manager', status: 'Active', lastLogin: '2026-08-12 07:45:00', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
  { id: generateId(), name: 'Viewer User', email: 'viewer@example.com', role: 'Viewer', status: 'Active', lastLogin: '2026-08-11 16:20:00', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: generateId(), name: 'John Smith', email: 'john.smith@example.com', role: 'Manager', status: 'Active', lastLogin: '2026-08-12 09:15:00', createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-03-10T00:00:00Z' },
  { id: generateId(), name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'Viewer', status: 'Active', lastLogin: '2026-08-11 14:30:00', createdAt: '2026-04-05T00:00:00Z', updatedAt: '2026-04-05T00:00:00Z' },
  { id: generateId(), name: 'Mike Wilson', email: 'mike.wilson@example.com', role: 'Manager', status: 'Inactive', lastLogin: '2026-07-20 10:00:00', createdAt: '2026-05-12T00:00:00Z', updatedAt: '2026-05-12T00:00:00Z' },
  { id: generateId(), name: 'Emily Brown', email: 'emily.brown@example.com', role: 'Viewer', status: 'Active', lastLogin: '2026-08-10 11:45:00', createdAt: '2026-06-08T00:00:00Z', updatedAt: '2026-06-08T00:00:00Z' },
  { id: generateId(), name: 'David Lee', email: 'david.lee@example.com', role: 'Administrator', status: 'Active', lastLogin: '2026-08-12 06:30:00', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: generateId(), name: 'Lisa Chen', email: 'lisa.chen@example.com', role: 'Manager', status: 'Active', lastLogin: '2026-08-11 13:15:00', createdAt: '2026-07-15T00:00:00Z', updatedAt: '2026-07-15T00:00:00Z' },
  { id: generateId(), name: 'Robert Taylor', email: 'robert.taylor@example.com', role: 'Viewer', status: 'Active', lastLogin: '2026-08-10 15:30:00', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
];