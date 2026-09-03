// Shared in-memory auth store for Next.js App Router
// In production, this data is persisted in PostgreSQL / Supabase

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CONTENT_MANAGER' | 'CLIENT';
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  createdAt: string;
}

// Initial registered accounts — Yassine Aloulou is the SUPER_ADMIN
export const ACCOUNTS_STORE = new Map<string, StoredUserAccount>([
  [
    'yassinealoulou6@gmail.com',
    {
      id: 'user-superadmin-01',
      name: 'Yassine Aloulou (Directeur Général)',
      email: 'yassinealoulou6@gmail.com',
      phone: '+216 98 000 000',
      password: 'Yassine.123',
      role: 'SUPER_ADMIN',
      twoFactorEnabled: false,
      emailVerified: true,
      createdAt: '2026-09-02',
    },
  ],
]);

import { UserRole } from '@/types';

export const PENDING_REGISTRATIONS = new Map<string, {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  confirmationCode: string;
  expiresAt: number;
}>();

export const TWO_FACTOR_SESSIONS = new Map<string, {
  email: string;
  code: string;
  expiresAt: number;
}>();

// Brute-force attempt protection tracker: email -> { count, lockedUntil }
export const LOGIN_ATTEMPTS = new Map<string, { count: number; lockedUntil: number }>();
