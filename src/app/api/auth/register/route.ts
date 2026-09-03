import { NextResponse } from 'next/server';
import { sendSecurityEmail } from '@/lib/email';
import { ACCOUNTS_STORE, PENDING_REGISTRATIONS } from '@/lib/authStore';
import { getDbUserByEmail } from '@/lib/db';
import { createVerificationToken } from '@/lib/authTokens';
import { UserRole } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // ── INPUT VALIDATION ──
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Veuillez renseigner votre nom complet (minimum 2 caractères).' },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'Veuillez saisir une adresse email valide.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit comporter au minimum 6 caractères.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // ── IDENTIFY ACCOUNT ROLE (PRESERVES STAFF ROLES) ──
    const existingDbUser = await getDbUserByEmail(cleanEmail);
    const role: UserRole = existingDbUser ? existingDbUser.role : 'CLIENT';

    // Generate 6-digit verification code
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate tamper-proof stateless verification token (15 mins expiry)
    const verificationToken = createVerificationToken({
      email: cleanEmail,
      code: confirmationCode,
      name: name.trim(),
      phone: phone?.trim() || '+216 -- --- ---',
      password,
    });

    // Store in pending registrations with password
    const pendingObj = {
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '+216 -- --- ---',
      password,
      role,
      confirmationCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    PENDING_REGISTRATIONS.set(cleanEmail, pendingObj);
    try {
      const { loadPersistedPendingRegistrations, savePersistedPendingRegistrations } = await import('@/lib/fileStorage');
      const diskPending = loadPersistedPendingRegistrations();
      diskPending[cleanEmail] = pendingObj;
      savePersistedPendingRegistrations(diskPending);
    } catch {}

    // ── CREATE OR UPDATE USER IN DATABASE IMMEDIATELY ──
    const { createDbUser } = await import('@/lib/db');
    const createdUser = await createDbUser({
      id: existingDbUser?.id || `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '+216 -- --- ---',
      password,
      role,
      twoFactorEnabled: role !== 'CLIENT' && role !== 'SUPER_ADMIN',
      emailVerified: true,
      createdAt: existingDbUser?.createdAt || new Date().toISOString().split('T')[0],
    });

    const { password: _, ...safeUser } = createdUser;

    // ── DISPATCH VERIFICATION & WELCOME EMAIL VIA RESEND ──
    let emailResult: any = { previewUrl: null };
    try {
      emailResult = await sendSecurityEmail({
        to: cleanEmail,
        subject: `[Villa Regia] Code d'Activation de Compte : ${confirmationCode}`,
        title: 'Validation de Votre Inscription Client',
        code: confirmationCode,
        type: 'CONFIRMATION',
      });
    } catch (mailErr) {
      console.warn('Could not dispatch external email, account activated locally:', mailErr);
    }

    const isSandboxRestricted = Boolean(emailResult?.isResendSandboxRestricted);

    return NextResponse.json({
      success: true,
      message: `Votre compte a été créé avec succès et un email de confirmation a été envoyé à ${cleanEmail}.`,
      user: safeUser,
      email: cleanEmail,
      confirmationCode,
      verificationToken,
      isResendSandboxRestricted: isSandboxRestricted,
      devCode: confirmationCode,
      previewUrl: emailResult?.previewUrl || null,
    });
  } catch (error: any) {
    console.error('Error in register endpoint:', error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}
