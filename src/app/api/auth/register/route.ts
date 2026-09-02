import { NextResponse } from 'next/server';
import { sendSecurityEmail } from '@/lib/email';
import { ACCOUNTS_STORE, PENDING_REGISTRATIONS } from '@/lib/authStore';
import { getDbUserByEmail } from '@/lib/db';
import { createVerificationToken } from '@/lib/authTokens';

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

    // ── SECURITY CHECK: ACCOUNT ALREADY EXISTS IN DATABASE ──
    const existingDbUser = await getDbUserByEmail(cleanEmail);
    if (existingDbUser || ACCOUNTS_STORE.has(cleanEmail)) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.' },
        { status: 409 }
      );
    }

    // ── SECURITY: RESTRICT PUBLIC SIGNUP TO CLIENT ONLY ──
    const role = 'CLIENT';

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
    PENDING_REGISTRATIONS.set(cleanEmail, {
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '+216 -- --- ---',
      password,
      role,
      confirmationCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    // ── DISPATCH VERIFICATION EMAIL ──
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
      console.warn('Could not dispatch external email, code generated for local/fallback verification:', mailErr);
    }

    const isSandboxRestricted = Boolean(emailResult?.isResendSandboxRestricted);

    return NextResponse.json({
      success: true,
      message: isSandboxRestricted
        ? `Code d'activation généré pour ${cleanEmail}. (Mode Sandbox Resend : email délivré à villaregia.contact@gmail.com).`
        : `Votre code d'activation à 6 chiffres a été généré et envoyé à votre adresse email ${cleanEmail}.`,
      email: cleanEmail,
      verificationToken,
      isResendSandboxRestricted: isSandboxRestricted,
      devCode: isSandboxRestricted ? confirmationCode : undefined,
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
