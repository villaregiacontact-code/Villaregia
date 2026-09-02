import { NextResponse } from 'next/server';
import { ACCOUNTS_STORE, PENDING_REGISTRATIONS } from '@/lib/authStore';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Adresse email et code de confirmation requis.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();
    const pending = PENDING_REGISTRATIONS.get(cleanEmail);

    // Only allow activation with the strictly generated 6-digit email code
    const isMatch = pending && pending.confirmationCode === cleanCode;

    if (isMatch) {
      // Create permanent active user account
      const activatedUser = {
        id: `user-${Date.now()}`,
        name: pending?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: pending?.phone || '+216 -- --- ---',
        password: pending?.password,
        role: 'CLIENT' as const,
        twoFactorEnabled: false,
        emailVerified: true,
        createdAt: new Date().toISOString().split('T')[0],
      };

      // Store in active accounts store so user can log in subsequently
      ACCOUNTS_STORE.set(cleanEmail, activatedUser);

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
