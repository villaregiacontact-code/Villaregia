import { NextResponse } from 'next/server';
import { getDbUserByEmail, updateDbUser } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, currentPassword, newPassword } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Adresse email requise.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const account = await getDbUserByEmail(cleanEmail);

    if (!account) {
      return NextResponse.json(
        { error: 'Compte introuvable en base de données.' },
        { status: 404 }
      );
    }

    const updatePayload: any = {
      email: cleanEmail,
    };

    // ── UPDATE BASIC PROFILE INFO ──
    if (name && name.trim().length >= 2) {
      updatePayload.name = name.trim();
    }
    if (phone !== undefined) {
      updatePayload.phone = phone.trim();
    }

    // ── CHANGE PASSWORD (IF REQUESTED) ──
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' },
          { status: 400 }
        );
      }

      // If current password is provided or required
      if (account.password && currentPassword && account.password !== currentPassword) {
        return NextResponse.json(
          { error: 'Le mot de passe actuel est incorrect.' },
          { status: 401 }
        );
      }

      updatePayload.password = newPassword;
    }

    // Save updated account back into database
    const updatedAccount = await updateDbUser(updatePayload);

    if (!updatedAccount) {
      return NextResponse.json(
        { error: 'Erreur lors de la persistance en base de données.' },
        { status: 500 }
      );
    }

    const safeUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone || '',
      role: account.role,
      twoFactorEnabled: account.twoFactorEnabled,
      emailVerified: account.emailVerified,
      createdAt: account.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: 'Profil et sécurité mis à jour avec succès.',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil.' },
      { status: 500 }
    );
  }
}
