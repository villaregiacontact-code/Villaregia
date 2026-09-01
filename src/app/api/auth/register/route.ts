import { NextResponse } from 'next/server';
import { sendSecurityEmail } from '@/lib/email';

export const PENDING_REGISTRATIONS = new Map<string, {
  name: string;
  email: string;
  phone: string;
  role: string;
  confirmationCode: string;
  expiresAt: number;
}>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nom et adresse email requis.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate 6-digit confirmation code
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    PENDING_REGISTRATIONS.set(cleanEmail, {
      name,
      email: cleanEmail,
      phone: phone || '+216 -- --- ---',
      role: role || 'CLIENT',
      confirmationCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    // ── DISPATCH REAL EMAIL ──
    const emailResult = await sendSecurityEmail({
      to: cleanEmail,
      subject: `[Villa Regia] Code de Confirmation Email : ${confirmationCode}`,
      title: 'Confirmation de Votre Compte Membre',
      code: confirmationCode,
      type: 'CONFIRMATION',
    });

    return NextResponse.json({
      success: true,
      message: `Code de confirmation réellement envoyé par email à ${cleanEmail}.`,
      email: cleanEmail,
      confirmationCode,
      previewUrl: emailResult.previewUrl,
    });
  } catch (error: any) {
    console.error('Error sending registration email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l’envoi de l’email de confirmation.' },
      { status: 500 }
    );
  }
}
