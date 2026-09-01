// Shared in-memory auth session stores for Next.js App Router
export const PENDING_REGISTRATIONS = new Map<string, {
  name: string;
  email: string;
  phone: string;
  role: string;
  confirmationCode: string;
  expiresAt: number;
}>();

export const TWO_FACTOR_SESSIONS = new Map<string, {
  email: string;
  code: string;
  expiresAt: number;
}>();
