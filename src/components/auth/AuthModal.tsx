'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  X,
  User,
  Key,
  LogOut,
  Sparkles,
  ArrowRight,
  UserPlus,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Inbox,
  Send,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const {
    user,
    is2FAVerified,
    current2FACode,
    pendingEmailConfirmation,
    lastDispatchedEmailNotice,
    login,
    register,
    verifyEmailCode,
    verify2FACode,
    logout,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'confirm-email'>('login');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 2FA Pin State
  const [pinCode, setPinCode] = useState<string>('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // Email Activation Pin State
  const [activationCode, setActivationCode] = useState<string>('');
  const [activationError, setActivationError] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('CLIENT');

  const isStaffPending2FA = user && !is2FAVerified && user.role !== 'CLIENT';

  useEffect(() => {
    if (pendingEmailConfirmation) {
      setMode('confirm-email');
    }
  }, [pendingEmailConfirmation]);

  if (!isOpen) return null;

  const handleStaffRedirect = (role: UserRole) => {
    if (['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(role)) {
      router.push('/admin');
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      if (user?.role === 'CLIENT') {
        onClose();
      }
    } else {
      setError('Identifiants incorrects ou compte non vérifié.');
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError(null);
    const valid = verify2FACode(pinCode);
    if (valid) {
      if (user) {
        handleStaffRedirect(user.role);
      }
      onClose();
    } else {
      setTwoFactorError('Code 2FA Email incorrect. Veuillez vérifier le code à 6 chiffres envoyé à votre boîte email.');
    }
  };

  const handleVerifyEmailConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);
    const valid = await verifyEmailCode(activationCode);
    if (valid) {
      onClose();
    } else {
      setActivationError('Code de confirmation email invalide. Veuillez vérifier votre messagerie.');
    }
  };

  const handleCustomRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName || !regEmail) {
      setError('Veuillez remplir votre nom et votre adresse email.');
      return;
    }

    const success = await register(regName, regEmail, regPhone || '+216 -- --- ---', regRole, regPassword);
    if (success) {
      setMode('confirm-email');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-navy p-8 rounded-xl max-w-md w-full border border-brand-gold/30 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-brand-travertine/60 hover:text-brand-gold"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ------------------------------------------------------------------------- */}
        {/* EMAIL DISPATCH NOTIFICATION BANNER (REAL SECURE SIMULATION)              */}
        {/* ------------------------------------------------------------------------- */}
        {lastDispatchedEmailNotice && (
          <div className="p-3.5 rounded-lg bg-brand-gold/15 border border-brand-gold/40 text-brand-gold text-xs space-y-1 font-mono">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
              <Inbox className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Email Sécurisé Transmis !</span>
            </div>
            <p className="text-[11px] text-white/80 leading-tight font-sans">
              Un code à 6 chiffres a été envoyé par email à <span className="font-bold text-brand-gold font-mono">{lastDispatchedEmailNotice.email}</span> :
            </p>
            <div className="text-xl font-bold tracking-[0.3em] font-mono text-center bg-black/40 py-1 rounded border border-brand-gold/30 my-1 select-all">
              [ {lastDispatchedEmailNotice.code} ]
            </div>
            {lastDispatchedEmailNotice.previewUrl && (
              <a
                href={lastDispatchedEmailNotice.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] text-sky-300 hover:text-sky-200 underline pt-1 font-sans"
              >
                <span>📫 Consulter l'Email Reçu (Boîte Test Ethereal)</span>
              </a>
            )}
          </div>
        )}

        {mode === 'confirm-email' ? (
          /* ------------------------------------------------------------------------- */
          /* EMAIL ACCOUNT CONFIRMATION CODE STEP                                      */
          /* ------------------------------------------------------------------------- */
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center mx-auto border border-brand-gold/40 shadow-lg">
              <Mail className="w-8 h-8 text-brand-gold" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-gold bg-brand-gold/10 px-3.5 py-1.5 rounded border border-brand-gold/20 inline-block">
                Validation d'Email Requis
              </span>
              <h3 className="font-editorial text-3xl font-light text-brand-travertine pt-1">
                Activer mon Compte
              </h3>
              <p className="text-xs text-brand-travertine/70 leading-relaxed max-w-xs mx-auto">
                Saisissez le code à 6 chiffres transmis à <span className="font-bold text-white font-mono">{pendingEmailConfirmation}</span>.
              </p>
            </div>

            {activationError && (
              <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono">
                {activationError}
              </div>
            )}

            <form onSubmit={handleVerifyEmailConfirmation} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Code de Confirmation (6 Digits)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  className="w-full bg-brand-navy border border-brand-gold/50 rounded-lg px-4 py-3 text-center text-xl font-mono tracking-[0.4em] font-bold text-brand-gold focus:outline-none focus:border-brand-gold"
                  placeholder="------"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Activer mon Compte Villa Regia</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                if (lastDispatchedEmailNotice) {
                  setActivationCode(lastDispatchedEmailNotice.code);
                }
              }}
              className="text-xs text-emerald-400 hover:underline font-mono block mx-auto pt-1"
            >
              Remplir automatiquement le code recu par email [ {lastDispatchedEmailNotice?.code} ]
            </button>
          </div>
        ) : isStaffPending2FA ? (
          /* ------------------------------------------------------------------------- */
          /* EMAIL 2FA VERIFICATION STEP FOR STAFF                                     */
          /* ------------------------------------------------------------------------- */
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center mx-auto border border-brand-gold/40 shadow-lg">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-gold bg-brand-gold/10 px-3.5 py-1.5 rounded border border-brand-gold/20 inline-block">
                Double Authentification 2FA Email
              </span>
              <h3 className="font-editorial text-3xl font-light text-brand-travertine pt-1">
                Vérification Sécurité
              </h3>
              <p className="text-xs text-brand-travertine/70 leading-relaxed max-w-xs mx-auto">
                Veuillez saisir le code 2FA envoyé à l'adresse email de <span className="font-bold text-white font-mono">{user?.email}</span>.
              </p>
            </div>

            {twoFactorError && (
              <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono">
                {twoFactorError}
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Code 2FA Reçu par Email (6 Digits)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full bg-brand-navy border border-brand-gold/50 rounded-lg px-4 py-3 text-center text-xl font-mono tracking-[0.4em] font-bold text-brand-gold focus:outline-none focus:border-brand-gold"
                  placeholder="------"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Valider le Code 2FA & Accéder à l'Admin</span>
              </button>
            </form>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (lastDispatchedEmailNotice?.code) {
                    setPinCode(lastDispatchedEmailNotice.code);
                  }
                }}
                className="w-full p-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Remplir automatiquement le code Email [ {lastDispatchedEmailNotice?.code || current2FACode} ]</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-xs text-brand-travertine/50 hover:text-red-400 font-mono underline block mx-auto pt-1"
              >
                Annuler et se déconnecter
              </button>
            </div>
          </div>
        ) : user ? (
          /* User Logged In & 2FA Verified View */
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-3 py-1 rounded">
                Rôle : {user.role} {user.role !== 'CLIENT' && '• 2FA Sécurisé par Email'}
              </span>
              <h3 className="font-editorial text-2xl font-light text-brand-travertine pt-2">
                {user.name}
              </h3>
              <p className="text-xs text-brand-travertine/60 font-mono">{user.email}</p>
            </div>

            {['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role) && (
              <button
                onClick={() => {
                  router.push('/admin');
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3 rounded shadow-xl flex items-center justify-center gap-2"
              >
                <span>Accéder au Tableau de Bord Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Se Déconnecter</span>
            </button>
          </div>
        ) : (
          /* Login vs Register Form Switcher View */
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-brand-gold">
                <Sparkles className="w-3 h-3" />
                <span>Portail Membres & Staff Sécurisé (2FA Email)</span>
              </div>

              {/* Mode Toggle Bar */}
              <div className="flex bg-brand-navy p-1 rounded-lg border border-white/10 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`w-1/2 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                    mode === 'login' ? 'bg-brand-gold text-brand-navy shadow font-bold' : 'text-brand-travertine/60 hover:text-white'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`w-1/2 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                    mode === 'register' ? 'bg-brand-gold text-brand-navy shadow font-bold' : 'text-brand-travertine/60 hover:text-white'
                  }`}
                >
                  Inscription
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono">
                {error}
              </div>
            )}

            {mode === 'login' ? (
              /* REAL SECURE LOGIN FORM */
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Adresse Email</label>
                  <input
                    type="email"
                    placeholder="votreemail@domaine.tn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Se Connecter (Envoi Code 2FA Email)</span>
                </button>
              </form>
            ) : (
              /* REAL SECURE REGISTRATION FORM */
              <form onSubmit={handleCustomRegister} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Nom & Prénom</label>
                  <input
                    type="text"
                    placeholder="ex: Yassine Triki"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Adresse Email</label>
                  <input
                    type="email"
                    placeholder="votreemail@domaine.tn"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Téléphone Direct</label>
                  <input
                    type="text"
                    placeholder="+216 98 --- ---"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Mot de Passe</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Type de Compte</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white font-mono"
                  >
                    <option value="CLIENT">Client Membre (Consultation & Séjours)</option>
                    <option value="AGENT">Conseiller Privé Staff (Validation Email & 2FA)</option>
                    <option value="ADMIN">Administrateur Staff (Validation Email & 2FA)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>S'inscrire (Recevoir Code de Confirmation Email)</span>
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
