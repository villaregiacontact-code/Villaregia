import { NextResponse } from 'next/server';
import { ACCOUNTS_STORE } from '@/lib/authStore';
import { UserRole } from '@/types';

// GET all accounts
export async function GET() {
  try {
    const users: any[] = [];
    ACCOUNTS_STORE.forEach((account) => {
      users.push({
        id: account.id,
        name: account.name,
        email: account.email,
        phone: account.phone || '',
        role: account.role,
        twoFactorEnabled: account.twoFactorEnabled,
        emailVerified: account.emailVerified,
        createdAt: account.createdAt,
        hasPassword: !!account.password,
      });
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors du chargement des utilisateurs.' },
      { status: 500 }
    );
  }
}

// POST: Add new staff user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, password, phone } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Veuillez renseigner le nom du collaborateur.' },
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

    if (ACCOUNTS_STORE.has(cleanEmail)) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cette adresse email.' },
        { status: 409 }
      );
    }

    const validRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER', 'CLIENT'];
    const staffRole: UserRole = validRoles.includes(role) ? role : 'ADMIN';

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '+216 -- --- ---',
      password: password,
      role: staffRole,
      twoFactorEnabled: staffRole !== 'CLIENT',
      emailVerified: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    ACCOUNTS_STORE.set(cleanEmail, newUser);

    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      message: `Compte staff ${newUser.name} (${staffRole}) créé avec succès.`,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error creating staff account:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte staff.' },
      { status: 500 }
    );
  }
}

// PUT: Edit existing staff user (Name, Role, Password, Phone)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, role, password, phone } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis pour identifier le compte.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let account = ACCOUNTS_STORE.get(cleanEmail);

    // If not found by email, try by id
    if (!account && id) {
      const entries = Array.from(ACCOUNTS_STORE.entries());
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][1].id === id) {
          account = entries[i][1];
          break;
        }
      }
    }

    if (!account) {
      return NextResponse.json(
        { error: 'Compte introuvable.' },
        { status: 404 }
      );
    }

    if (name && name.trim().length >= 2) {
      account.name = name.trim();
    }

    if (phone !== undefined) {
      account.phone = phone.trim();
    }

    if (role) {
      account.role = role;
    }

    if (password && password.trim()) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Le mot de passe doit comporter au moins 6 caractères.' },
          { status: 400 }
        );
      }
      account.password = password.trim();
    }

    ACCOUNTS_STORE.set(account.email, account);

    const { password: _, ...safeUser } = account;

    return NextResponse.json({
      success: true,
      message: `Compte de ${account.name} mis à jour avec succès.`,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error updating staff account:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du compte staff.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a staff user
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

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      ACCOUNTS_STORE.delete(cleanEmail);
    } else if (id) {
      const entries = Array.from(ACCOUNTS_STORE.entries());
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][1].id === id) {
          ACCOUNTS_STORE.delete(entries[i][0]);
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Compte supprimé avec succès.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte.' },
      { status: 500 }
    );
  }
}
