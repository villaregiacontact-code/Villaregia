'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, Permission, AuditLog } from '@/types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'properties.create',
    'properties.read',
    'properties.update',
    'properties.delete',
    'properties.publish',
    'leads.read',
    'leads.update',
    'reservations.read',
    'reservations.manage',
    'content.manage',
    'users.manage',
    'settings.manage',
  ],
  ADMIN: [
    'properties.create',
    'properties.read',
    'properties.update',
    'properties.delete',
    'properties.publish',
    'leads.read',
    'leads.update',
    'reservations.read',
    'reservations.manage',
    'content.manage',
  ],
  AGENT: [
    'properties.read',
    'properties.update',
    'leads.read',
    'leads.update',
    'reservations.read',
  ],
  CONTENT_MANAGER: [
    'properties.read',
    'content.manage',
  ],
  CLIENT: [
    'properties.read',
  ],
};

export interface StoredClientCredentials extends UserAccount {
  password?: string;
}

// Registered client accounts (created dynamically via public registration flow)
export const REGISTERED_CLIENTS: StoredClientCredentials[] = [];

// Admin / Staff accounts — configured with Yassine Aloulou as SUPER_ADMIN
export const INITIAL_STAFF_ACCOUNTS: (UserAccount & { password?: string })[] = [
  {
    id: 'user-superadmin-01',
    name: 'Yassine Aloulou (Directeur Général)',
    email: 'yassinealoulou6@gmail.com',
    phone: '+216 98 000 000',
    password: 'Yassine.123',
    role: 'SUPER_ADMIN',
    twoFactorEnabled: false,
    emailVerified: true,
    createdAt: '2026-09-02',
  },
];

export interface AuthResponse {
  success: boolean;
  requires2FA?: boolean;
  error?: string;
  user?: UserAccount;
}

interface AuthContextType {
  user: UserAccount | null;
  is2FAVerified: boolean;
  current2FACode: string | null;
  pendingEmailConfirmation: string | null;
  lastDispatchedEmailNotice: { type: 'CONFIRMATION' | '2FA'; email: string; code?: string; previewUrl?: string | null; isResendSandboxRestricted?: boolean } | null;
  generate2FACode: () => string;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  register: (name: string, email: string, phone: string, role: UserRole, password?: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailCode: (code: string) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  verify2FACode: (code: string) => boolean;
  cancelEmailVerification: () => void;
  logout: () => void;
  hasPermission: (perm: Permission) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  auditLogs: AuditLog[];
  logAction: (action: string, target: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [is2FAVerified, setIs2FAVerified] = useState<boolean>(false);
  const [current2FACode, setCurrent2FACode] = useState<string | null>(null);
  const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState<string | null>(null);
  const [lastDispatchedEmailNotice, setLastDispatchedEmailNotice] = useState<{ type: 'CONFIRMATION' | '2FA'; email: string; code?: string; previewUrl?: string | null; isResendSandboxRestricted?: boolean } | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('vr_user');
      const saved2FA = localStorage.getItem('vr_2fa_verified');
      if (savedUser) {
        const u: UserAccount = JSON.parse(savedUser);
        setUser(u);
        setIs2FAVerified(saved2FA === 'true' || saved2FA !== 'false');
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
  }, []);

  const generate2FACode = (): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrent2FACode(code);
    return code;
  };

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Check local accounts fallback
        let localAccounts: StoredClientCredentials[] = [];
        try {
          localAccounts = JSON.parse(localStorage.getItem('vr_custom_accounts') || '[]');
        } catch {}
        const allAccounts = [...INITIAL_STAFF_ACCOUNTS, ...REGISTERED_CLIENTS, ...localAccounts];
        const foundAccount = allAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
        if (foundAccount && (!foundAccount.password || foundAccount.password === pass)) {
          const safeUser: UserAccount = {
            id: foundAccount.id,
            name: foundAccount.name,
            email: foundAccount.email,
            role: foundAccount.role,
            twoFactorEnabled: false,
            emailVerified: true,
            createdAt: foundAccount.createdAt,
          };
          setUser(safeUser);
          localStorage.setItem('vr_user', JSON.stringify(safeUser));
          setIs2FAVerified(true);
          localStorage.setItem('vr_2fa_verified', 'true');
          return { success: true, requires2FA: false, user: safeUser };
        }
        return { success: false, error: data.error || 'Erreur lors de la connexion.' };
      }

      const userObj: UserAccount = data.user;
      setUser(userObj);
      localStorage.setItem('vr_user', JSON.stringify(userObj));

      // Cache locally for instant resilience
      try {
        const existing: StoredClientCredentials[] = JSON.parse(localStorage.getItem('vr_custom_accounts') || '[]');
        if (!existing.some(a => a.email.toLowerCase() === cleanEmail)) {
          localStorage.setItem('vr_custom_accounts', JSON.stringify([...existing, { ...userObj, password: pass }]));
        }
      } catch {}

      if (data.requires2FA) {
        setIs2FAVerified(false);
        localStorage.setItem('vr_2fa_verified', 'false');
        
        const code = data.twoFactorCode || generate2FACode();
        setCurrent2FACode(code);
        setLastDispatchedEmailNotice({
          type: '2FA',
          email: cleanEmail,
          code,
          previewUrl: data.previewUrl,
        });

        logAction('Connexion au compte (Attente 2FA)', userObj.role);
        return { success: true, requires2FA: true, user: userObj };
      }

      // CLIENT or Staff with direct password login
      setIs2FAVerified(true);
      localStorage.setItem('vr_2fa_verified', 'true');
      setCurrent2FACode(null);

      logAction('Connexion au compte', userObj.role);
      return { success: true, requires2FA: false, user: userObj };
    } catch (e: any) {
      // Offline / API Fallback — check registered clients and local custom accounts
      let localAccounts: StoredClientCredentials[] = [];
      try {
        localAccounts = JSON.parse(localStorage.getItem('vr_custom_accounts') || '[]');
      } catch {}

      const allAccounts = [...INITIAL_STAFF_ACCOUNTS, ...REGISTERED_CLIENTS, ...localAccounts];
      const foundAccount = allAccounts.find((a) => a.email.toLowerCase() === cleanEmail);

      if (!foundAccount) {
        return { success: false, error: 'Identifiants incorrects. Aucun compte trouvé avec cet email.' };
      }

      if (foundAccount.password && foundAccount.password !== pass) {
        return { success: false, error: 'Mot de passe incorrect. Veuillez vérifier votre saisie.' };
      }

      const safeUser: UserAccount = {
        id: foundAccount.id,
        name: foundAccount.name,
        email: foundAccount.email,
        role: foundAccount.role,
        twoFactorEnabled: false,
        emailVerified: true,
        createdAt: foundAccount.createdAt,
      };

      setUser(safeUser);
      localStorage.setItem('vr_user', JSON.stringify(safeUser));
      setIs2FAVerified(true);
      localStorage.setItem('vr_2fa_verified', 'true');

      logAction('Connexion Sécurisée (Local)', safeUser.role);
      return { success: true, requires2FA: false, user: safeUser };
    }
  };

  const register = async (name: string, email: string, phone: string, role: UserRole, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, phone, role: 'CLIENT', password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Erreur lors de l'inscription." };
      }

      if (data.user) {
        setUser(data.user);
        setIs2FAVerified(true);
        try {
          localStorage.setItem('vr_user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('auth-change'));
        } catch {}
      }

      setPendingEmailConfirmation(cleanEmail);
      setLastDispatchedEmailNotice({
        type: 'CONFIRMATION',
        email: cleanEmail,
        code: data.confirmationCode || data.devCode,
        previewUrl: data.previewUrl,
        isResendSandboxRestricted: data.isResendSandboxRestricted,
      });

      // Save pending registration locally with verification token
      try {
        const pendingObj = { name, email: cleanEmail, phone, password, code: data.confirmationCode || data.devCode };
        localStorage.setItem(`vr_pending_${cleanEmail}`, JSON.stringify(pendingObj));
        if (data.verificationToken) {
          localStorage.setItem(`vr_token_${cleanEmail}`, data.verificationToken);
        }
      } catch {}

      logAction('Création & Activation Compte Client', cleanEmail);
      return { success: true };
    } catch (e: any) {
      // Local fallback
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setPendingEmailConfirmation(cleanEmail);
      setLastDispatchedEmailNotice({
        type: 'CONFIRMATION',
        email: cleanEmail,
        code,
      });

      try {
        const pendingObj = { name, email: cleanEmail, phone, password, code };
        localStorage.setItem(`vr_pending_${cleanEmail}`, JSON.stringify(pendingObj));
      } catch {}

      return { success: true };
    }
  };

  const verifyEmailCode = async (code: string): Promise<{ success: boolean; error?: string; user?: UserAccount }> => {
    if (!pendingEmailConfirmation) {
      return { success: false, error: 'Aucune confirmation en attente.' };
    }

    const cleanCode = code.trim();
    let token = '';
    let pendingObj: any = null;
    try {
      token = localStorage.getItem(`vr_token_${pendingEmailConfirmation}`) || '';
      const raw = localStorage.getItem(`vr_pending_${pendingEmailConfirmation}`);
      if (raw) pendingObj = JSON.parse(raw);
    } catch {}

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmailConfirmation,
          code: cleanCode,
          verificationToken: token,
          name: pendingObj?.name,
          phone: pendingObj?.phone,
          password: pendingObj?.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Fallback check if code matches locally stored pending code
        if (pendingObj && String(pendingObj.code).trim() === cleanCode) {
          const activated: UserAccount = {
            id: `usr-${Date.now()}`,
            name: pendingObj.name || pendingEmailConfirmation.split('@')[0],
            email: pendingEmailConfirmation,
            phone: pendingObj.phone || '+216 -- --- ---',
            role: 'CLIENT',
            twoFactorEnabled: false,
            emailVerified: true,
            createdAt: new Date().toISOString().split('T')[0],
          };

          setUser(activated);
          localStorage.setItem('vr_user', JSON.stringify(activated));
          setIs2FAVerified(true);
          localStorage.setItem('vr_2fa_verified', 'true');
          setPendingEmailConfirmation(null);
          setLastDispatchedEmailNotice(null);

          try {
            const existing = JSON.parse(localStorage.getItem('vr_custom_accounts') || '[]');
            localStorage.setItem('vr_custom_accounts', JSON.stringify([...existing, { ...activated, password: pendingObj.password }]));
            localStorage.removeItem(`vr_pending_${activated.email}`);
            localStorage.removeItem(`vr_token_${activated.email}`);
          } catch {}

          return { success: true, user: activated };
        }

        return { success: false, error: data.error || 'Code de confirmation invalide ou expiré.' };
      }

      const activated: UserAccount = data.user;
      setUser(activated);
      localStorage.setItem('vr_user', JSON.stringify(activated));
      setIs2FAVerified(true);
      localStorage.setItem('vr_2fa_verified', 'true');
      setPendingEmailConfirmation(null);
      setLastDispatchedEmailNotice(null);

      // Save to local custom accounts
      try {
        const existing = JSON.parse(localStorage.getItem('vr_custom_accounts') || '[]');
        const password = pendingObj ? pendingObj.password : undefined;
        localStorage.setItem('vr_custom_accounts', JSON.stringify([...existing, { ...activated, password }]));
        localStorage.removeItem(`vr_pending_${activated.email}`);
        localStorage.removeItem(`vr_token_${activated.email}`);
      } catch {}

      logAction('Activation Compte par Code Email', activated.email);
      return { success: true, user: activated };
    } catch (e) {
      // Local fallback
      if (pendingObj && String(pendingObj.code).trim() === cleanCode) {
        const activated: UserAccount = {
          id: `usr-${Date.now()}`,
          name: pendingObj.name || pendingEmailConfirmation.split('@')[0],
          email: pendingEmailConfirmation,
          role: 'CLIENT',
          twoFactorEnabled: false,
          emailVerified: true,
          createdAt: new Date().toISOString().split('T')[0],
        };

        setUser(activated);
        localStorage.setItem('vr_user', JSON.stringify(activated));
        setIs2FAVerified(true);
        localStorage.setItem('vr_2fa_verified', 'true');
        setPendingEmailConfirmation(null);
        setLastDispatchedEmailNotice(null);

        try {
          const existing = JSON.parse(localStorage.getItem('vr_custom_accounts') || '[]');
          localStorage.setItem('vr_custom_accounts', JSON.stringify([...existing, { ...activated, password: pendingObj.password }]));
          localStorage.removeItem(`vr_pending_${activated.email}`);
          localStorage.removeItem(`vr_token_${activated.email}`);
        } catch {}

        logAction('Activation Compte par Code Email (Fallback)', activated.email);
        return { success: true, user: activated };
      }

      return { success: false, error: 'Code de confirmation incorrect. Veuillez vérifier votre boîte de réception.' };
    }
  };

  const cancelEmailVerification = () => {
    setPendingEmailConfirmation(null);
    setLastDispatchedEmailNotice(null);
  };

  const verify2FACode = (code: string): boolean => {
    const cleanCode = code.replace(/\s+/g, '');
    const valid = cleanCode && (cleanCode === current2FACode || cleanCode === lastDispatchedEmailNotice?.code);

    if (valid) {
      setIs2FAVerified(true);
      localStorage.setItem('vr_2fa_verified', 'true');
      setLastDispatchedEmailNotice(null);
      logAction('Validation 2FA Réussie', `Code ${cleanCode} validé`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) {
      logAction('Déconnexion session', user.role);
    }
    setUser(null);
    setIs2FAVerified(false);
    setCurrent2FACode(null);
    setPendingEmailConfirmation(null);
    setLastDispatchedEmailNotice(null);
    localStorage.removeItem('vr_user');
    localStorage.removeItem('vr_2fa_verified');
  };

  const hasPermission = (perm: Permission): boolean => {
    if (!user || (!is2FAVerified && user.role !== 'CLIENT')) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(perm);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const checkRoles = Array.isArray(roles) ? roles : [roles];
    return checkRoles.includes(user.role);
  };

  const logAction = (action: string, target: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      userEmail: user ? user.email : 'visiteur@anonyme',
      userName: user ? user.name : 'Visiteur Inconnu',
      role: user ? user.role : 'CLIENT',
      action,
      target,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        is2FAVerified,
        current2FACode,
        pendingEmailConfirmation,
        lastDispatchedEmailNotice,
        generate2FACode,
        login,
        register,
        verifyEmailCode,
        verify2FACode,
        cancelEmailVerification,
        logout,
        hasPermission,
        hasRole,
        auditLogs,
        logAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
