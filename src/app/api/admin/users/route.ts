import { NextResponse } from 'next/server';
import { getDbUsers, getDbUserByEmail, createDbUser, updateDbUser, deleteDbUser } from '@/lib/db';
import { UserRole } from '@/types';

// GET all accounts (both Staff and Clients)
export async function GET() {
  try {
    const rawUsers = await getDbUsers();
    const users = rawUsers.map((account) => ({
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone || '',
      role: account.role,
      twoFactorEnabled: !!account.twoFactorEnabled,
      emailVerified: !!account.emailVerified,
      createdAt: account.createdAt,
      hasPassword: !!account.password,
    }));

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error('Error fetching users from database:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des utilisateurs depuis la base de données.' },
      { status: 500 }
    );
  }
}

// POST: Add new user account (Staff or Client)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, password, phone, twoFactorEnabled } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Veuillez renseigner le nom de l\'utilisateur.' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit comporter au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await getDbUserByEmail(cleanEmail);

    if (existing) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cette adresse email.' },
        { status: 409 }
      );
    }

    const validRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER', 'CLIENT'];
    const accountRole: UserRole = validRoles.includes(role) ? role : 'ADMIN';
    const is2FA = twoFactorEnabled !== undefined ? Boolean(twoFactorEnabled) : false;

    const newUser = await createDbUser({
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '+216 -- --- ---',
      password: password,
      role: accountRole,
      twoFactorEnabled: is2FA,
      emailVerified: true,
    });

    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      message: `Compte ${newUser.name} (${accountRole}) créé et synchronisé en base de données.`,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error creating user account in database:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte en base de données.' },
      { status: 500 }
    );
  }
}

// PUT: Edit existing user account (Name, Role, Password, Phone, Verification status)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, role, password, phone, emailVerified, twoFactorEnabled } = body;

    if (!email && !id) {
      return NextResponse.json(
        { error: 'Email ou ID requis pour identifier le compte.' },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';

    const updatePayload: any = {
      email: cleanEmail,
      id,
    };

    if (name && name.trim().length >= 2) {
      updatePayload.name = name.trim();
    }

    if (phone !== undefined) {
      updatePayload.phone = phone.trim();
    }

    if (role) {
      updatePayload.role = role;
    }

    if (emailVerified !== undefined) {
      updatePayload.emailVerified = Boolean(emailVerified);
    }

    if (twoFactorEnabled !== undefined) {
      updatePayload.twoFactorEnabled = Boolean(twoFactorEnabled);
    }

    if (password && password.trim()) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Le mot de passe doit comporter au moins 6 caractères.' },
          { status: 400 }
        );
      }
      updatePayload.password = password.trim();
    }

    const updatedUser = await updateDbUser(updatePayload);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Compte introuvable en base de données.' },
        { status: 404 }
      );
    }

    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      message: `Compte de ${updatedUser.name} mis à jour et persisté en base de données.`,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error updating account in database:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du compte en base de données.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user account from database
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (!email && !id) {
      return NextResponse.json(
        { error: 'Email ou ID requis.' },
        { status: 400 }
      );
    }

    const success = await deleteDbUser(email || undefined, id || undefined);

    if (!success) {
      return NextResponse.json(
        { error: 'Compte introuvable en base de données.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Compte supprimé de la base de données avec succès.',
    });
  } catch (error: any) {
    console.error('Error deleting account from database:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte en base de données.' },
      { status: 500 }
    );
  }
}
