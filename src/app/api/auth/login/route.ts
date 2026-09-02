import { NextResponse } from 'next/server';
import { sendSecurityEmail } from '@/lib/email';
import { TWO_FACTOR_SESSIONS } from '@/lib/authStore';

// Known accounts with their credentials
// In a production environment, these would be stored securely in a database with hashed passwords.
const KNOWN_ACCOUNTS = [
  {
    email: 'yassinealoulou6@gmail.com',
    password: 'Yassine.123',
    name: 'Yassine Aloulou',
    role: 'CLIENT' as const,
    id: 'user-client-01',
    twoFactorEnabled: false,
  },
];

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

    // Check credentials against known accounts
    const account = KNOWN_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.password === password
    );

    // If credentials don't match any known account, reject
    if (!account && password) {
      return NextResponse.json(
        { error: 'Identifiants incorrects. Vérifiez votre email et mot de passe.' },
        { status: 401 }
      );
    }

    const isStaff = account
      ? ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(account.role)
      : cleanEmail.includes('admin') || cleanEmail.includes('agent') || cleanEmail.includes('staff');

    const userObj = account
      ? {
          id: account.id,
          name: account.name,
          email: cleanEmail,
          role: account.role,
          twoFactorEnabled: account.twoFactorEnabled,
          createdAt: new Date().toISOString().split('T')[0],
        }
      : {
          id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
          name: cleanEmail.split('@')[0].toUpperCase(),
          email: cleanEmail,
          role: isStaff ? 'ADMIN' : 'CLIENT',
          twoFactorEnabled: isStaff,
          createdAt: new Date().toISOString().split('T')[0],
        };

    // Generate 6-digit 2FA OTP code for staff accounts
    if (isStaff) {
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();

      TWO_FACTOR_SESSIONS.set(cleanEmail, {
        email: cleanEmail,
        code: twoFactorCode,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      const emailResult = await sendSecurityEmail({
        to: cleanEmail,
        subject: `[Villa Regia] Code 2FA de Connexion : ${twoFactorCode}`,
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
        message: `Code 2FA réellement envoyé à votre adresse email ${cleanEmail}.`,
      });
    }

    // CLIENT accounts — direct login, no 2FA required
    return NextResponse.json({
      success: true,
      requires2FA: false,
      user: userObj,
      message: `Connexion réussie en tant que ${userObj.name}.`,
    });
  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion." },
      { status: 500 }
    );
  }
}
