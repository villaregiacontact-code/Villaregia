import { NextResponse } from 'next/server';
import { PENDING_REGISTRATIONS } from '@/lib/authStore';
import { createDbUser } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import { verifyVerificationToken } from '@/lib/authTokens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, verificationToken, name, phone, password } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Adresse email et code de confirmation requis.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    // 1. Check in-memory pending registrations
    const pending = PENDING_REGISTRATIONS.get(cleanEmail);
    let isMatch = pending && pending.confirmationCode === cleanCode;
    let resolvedName = pending?.name || name || cleanEmail.split('@')[0];
    let resolvedPhone = pending?.phone || phone || '+216 -- --- ---';
    let resolvedPassword = pending?.password || password;

    // 2. If memory was lost (e.g. serverless instance switch), verify stateless token
    if (!isMatch && verificationToken) {
      const tokenPayload = verifyVerificationToken(verificationToken);
      if (
        tokenPayload &&
        tokenPayload.email === cleanEmail &&
        tokenPayload.code === cleanCode
      ) {
        isMatch = true;
        resolvedName = tokenPayload.name || resolvedName;
        resolvedPhone = tokenPayload.phone || resolvedPhone;
        resolvedPassword = tokenPayload.password || resolvedPassword;
      }
    }

    if (isMatch) {
      // Create permanent active user account and persist in database
      const activatedUser = await createDbUser({
        id: `user-${Date.now()}`,
        name: resolvedName,
        email: cleanEmail,
        phone: resolvedPhone,
        password: resolvedPassword,
        role: 'CLIENT',
        twoFactorEnabled: false,
        emailVerified: true,
        createdAt: new Date().toISOString().split('T')[0],
      });

      // Clean up pending registration
      PENDING_REGISTRATIONS.delete(cleanEmail);

      // ── AUTOMATED WELCOME EMAIL DISPATCH ──
      try {
        await sendWelcomeEmail({
          to: cleanEmail,
          name: activatedUser.name,
        });
      } catch (welcomeErr) {
        console.warn('Could not dispatch welcome email:', welcomeErr);
      }

      // Return user profile without leaking password
      const { password: _, ...safeUser } = activatedUser;

      return NextResponse.json({
        success: true,
        message: 'Compte activé avec succès ! Un email de bienvenue vous a été transmis.',
        user: safeUser,
      });
    }

    return NextResponse.json(
      { error: 'Code de confirmation incorrect ou expiré. Veuillez vérifier votre boîte de réception.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in verify-email endpoint:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du code de sécurité.' },
      { status: 500 }
    );
  }
}
