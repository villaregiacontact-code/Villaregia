import { NextResponse } from 'next/server';
import { sendSecurityEmail } from '@/lib/email';
import { ACCOUNTS_STORE, TWO_FACTOR_SESSIONS, LOGIN_ATTEMPTS } from '@/lib/authStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre adresse email.' },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre mot de passe.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // ── BRUTE-FORCE RATE-LIMITING PROTECTION ──
    const now = Date.now();
    const attemptRecord = LOGIN_ATTEMPTS.get(cleanEmail);
    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          error: `Compte temporairement verrouillé pour des raisons de sécurité. Réessayez dans ${remainingMinutes} minute(s).`,
        },
        { status: 429 }
      );
    }

    // ── LOOKUP ACCOUNT ──
    const account = ACCOUNTS_STORE.get(cleanEmail);

    // If account doesn't exist
    if (!account) {
      // Record failed attempt
      const currentAttempts = (attemptRecord?.count || 0) + 1;
      LOGIN_ATTEMPTS.set(cleanEmail, {
        count: currentAttempts,
        lockedUntil: currentAttempts >= 5 ? now + 5 * 60 * 1000 : 0,
      });

      return NextResponse.json(
        { error: 'Identifiants incorrects. Aucun compte associé à cette adresse email.' },
        { status: 401 }
      );
    }

    // ── VERIFY PASSWORD ──
    if (account.password && account.password !== password) {
      const currentAttempts = (attemptRecord?.count || 0) + 1;
      const isLocked = currentAttempts >= 5;
      LOGIN_ATTEMPTS.set(cleanEmail, {
        count: currentAttempts,
        lockedUntil: isLocked ? now + 5 * 60 * 1000 : 0,
      });

      return NextResponse.json(
        {
          error: isLocked
            ? 'Nombre maximal de tentatives atteint. Compte verrouillé pour 5 minutes.'
            : 'Mot de passe incorrect. Veuillez vérifier votre saisie.',
        },
        { status: 401 }
      );
    }

    // ── SUCCESS: RESET FAILED ATTEMPTS ──
    LOGIN_ATTEMPTS.delete(cleanEmail);

    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(account.role);

    const userObj = {
      id: account.id,
      name: account.name,
      email: cleanEmail,
      phone: account.phone || '+216 -- --- ---',
      role: account.role,
      twoFactorEnabled: isStaff || !!account.twoFactorEnabled,
      emailVerified: account.emailVerified ?? true,
      createdAt: account.createdAt,
    };

    const requires2FA = isStaff && account.twoFactorEnabled !== false;

    // ── STAFF ACCOUNTS WITH 2FA REQUIRE EMAIL OTP ──
    if (requires2FA) {
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();

      TWO_FACTOR_SESSIONS.set(cleanEmail, {
        email: cleanEmail,
        code: twoFactorCode,
        expiresAt: now + 10 * 60 * 1000,
      });

      const emailResult = await sendSecurityEmail({
        to: cleanEmail,
        subject: `[Villa Regia] Code 2FA de Connexion Sécurisée : ${twoFactorCode}`,
        title: 'Authentification Forte Double Facteur (2FA)',
        code: twoFactorCode,
        type: '2FA',
      });

      return NextResponse.json({
        success: true,
        requires2FA: true,
        user: userObj,
        twoFactorCode,
        previewUrl: emailResult.previewUrl,
        message: `Code 2FA envoyé à votre adresse email ${cleanEmail}.`,
      });
    }

    // ── DIRECT LOGIN (CLIENT or STAFF with direct login) ──
    return NextResponse.json({
      success: true,
      requires2FA: false,
      user: userObj,
      message: `Bienvenue, ${userObj.name}. Connexion réussie.`,
    });
  } catch (error: any) {
    console.error('Error in login endpoint:', error);
    return NextResponse.json(
      { error: 'Une erreur de sécurité est survenue lors de la connexion.' },
      { status: 500 }
    );
  }
}
