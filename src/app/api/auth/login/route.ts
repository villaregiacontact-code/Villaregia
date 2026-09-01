import { NextResponse } from 'next/server';
import { sendSecurityEmail } from '@/lib/email';
import { TWO_FACTOR_SESSIONS } from '@/lib/authStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Adresse email requise.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const isStaff = cleanEmail.includes('admin') || cleanEmail.includes('agent') || cleanEmail.includes('staff');

    // Generate 6-digit 2FA OTP code sent to Email
    const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();

    TWO_FACTOR_SESSIONS.set(cleanEmail, {
      email: cleanEmail,
      code: twoFactorCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // ── DISPATCH REAL 2FA EMAIL ──
    const emailResult = await sendSecurityEmail({
      to: cleanEmail,
      subject: `[Villa Regia] Code 2FA de Connexion : ${twoFactorCode}`,
      title: 'Authentification Forte Double Facteur (2FA)',
      code: twoFactorCode,
      type: '2FA',
    });

    const userObj = {
      id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      role: isStaff ? 'ADMIN' : 'CLIENT',
      twoFactorEnabled: isStaff,
      createdAt: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      requires2FA: isStaff,
      user: userObj,
      twoFactorCode,
      previewUrl: emailResult.previewUrl,
      message: `Code 2FA réellement envoyé à votre adresse email ${cleanEmail}.`,
    });
  } catch (error: any) {
    console.error('Error sending 2FA email:', error);
    return NextResponse.json(
      { error: 'Erreur d’envoi du code 2FA par email.' },
      { status: 500 }
    );
  }
}
