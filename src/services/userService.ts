// src/services/userService.ts
import { mockUsers } from '@/data/users';
import { User } from '@/types/common';
import { FilterParams, PaginatedResponse } from '@/types/common';
import { delay, generateId } from '@/lib/utils';

// TODO: Replace with real API

export const userService = {
  async getUsers(params: FilterParams = {}): Promise<PaginatedResponse<User>> {
    await delay(300);
    
    let data = [...mockUsers];
    
    if (params.search) {
      const search = params.search.toLowerCase();
      data = data.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }
    if (params.status) {
      data = data.filter(user => user.status === params.status);
    }
    
    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = data.slice(start, end);
    
    return {
      data: paginatedData,
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
    };
  },
  
  async getUserById(id: string): Promise<User | null> {
    await delay(200);
    return mockUsers.find(u => u.id === id) || null;
  },
  
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): Promise<User> {
    await delay(300);
    const newUser: User = {
      id: generateId(),
      ...userData,
      lastLogin: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },
  
  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    await delay(300);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) return null;
    mockUsers[index] = { ...mockUsers[index], ...userData, updatedAt: new Date().toISOString() };
    return mockUsers[index];
  },
  
  async deleteUser(id: string): Promise<boolean> {
    await delay(300);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) return false;
    mockUsers.splice(index, 1);
    return true;
  },
};