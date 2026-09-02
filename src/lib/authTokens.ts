import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'villaregia-secret-key-2026-luxury-real-estate';

export interface PendingTokenPayload {
  email: string;
  code: string;
  name: string;
  phone?: string;
  password?: string;
  expiresAt: number;
}

export function createVerificationToken(data: Omit<PendingTokenPayload, 'expiresAt'> & { expiresInMs?: number }): string {
  const expiresAt = Date.now() + (data.expiresInMs || 15 * 60 * 1000);
  const payload: PendingTokenPayload = {
    email: data.email.toLowerCase().trim(),
    code: data.code.trim(),
    name: data.name,
    phone: data.phone,
    password: data.password,
    expiresAt,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('base64url');

  return `${payloadStr}.${signature}`;
}

export function verifyVerificationToken(token: string): PendingTokenPayload | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('base64url');
    if (signature !== expectedSig) {
      return null;
    }

    const payload: PendingTokenPayload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (Date.now() > payload.expiresAt) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}
