'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Mail,
  ShieldCheck,
  CheckCircle2,
  Send,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// -----------------------------------------------------------------------------
// 6-DIGIT OTP PIN INPUT COMPONENT (ULTRA-SMOOTH AUTO-FOCUS & PASTE)
// -----------------------------------------------------------------------------
interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal) {
      // Clear digit
      const nextDigits = [...digits];
      nextDigits[index] = '';
      onChange(nextDigits.join(''));
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleanVal[cleanVal.length - 1];
    const newCode = nextDigits.join('');
    onChange(newCode);

    // Auto-advance to next input
    if (index < 5 && cleanVal) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, 5);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-between items-center gap-2 max-w-xs mx-auto my-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ''}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-11 h-13 text-center text-xl font-bold font-mono bg-brand-navy border border-brand-gold/40 rounded-xl text-brand-gold focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 focus:outline-none transition-all shadow-inner"
        />
      ))}
    </div>
  );
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const {
    user,
    is2FAVerified,
    pendingEmailConfirmation,
    login,
    register,
    verifyEmailCode,
    verify2FACode,
    logout,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'confirm-email'>('login');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // OTP Codes
  const [pinCode, setPinCode] = useState<string>('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  const [activationCode, setActivationCode] = useState<string>('');
  const [activationError, setActivationError] = useState<string | null>(null);

  // Resend Timer State
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Register Form State (CLIENT role only — admin accounts are configured via the admin panel)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const regRole: UserRole = 'CLIENT'; // Fixed: public registration creates CLIENT accounts only

  const isStaffPending2FA = user && !is2FAVerified && user.role !== 'CLIENT';

  useEffect(() => {
    if (pendingEmailConfirmation) {
      setMode('confirm-email');
    }
  }, [pendingEmailConfirmation]);

  // Resend countdown timer logic
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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
      } else {
        setResendTimer(60);
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
      setTwoFactorError('Code 2FA incorrect. Veuillez vérifier le code à 6 chiffres transmis par email.');
    }
  };

  const handleVerifyEmailConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);
    const valid = await verifyEmailCode(activationCode);
    if (valid) {
      onClose();
    } else {
      setActivationError('Code de confirmation invalide ou expiré.');
    }
  };

  const handleCustomRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName || !regEmail) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const success = await register(regName, regEmail, regPhone || '+216 -- --- ---', regRole, regPassword);
    if (success) {
      setMode('confirm-email');
      setResendTimer(60);
    }
  };

  const handleResendCode = () => {
    if (resendTimer === 0) {
      setResendTimer(60);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-navy p-8 rounded-2xl max-w-md w-full border border-brand-gold/30 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-brand-travertine/60 hover:text-brand-gold transition-colors p-1"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'confirm-email' ? (
          /* ------------------------------------------------------------------------- */
          /* EMAIL CONFIRMATION CODE STEP                                              */
          /* ------------------------------------------------------------------------- */
          <div className="space-y-6 text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center mx-auto border border-brand-gold/30 shadow-xl">
              <Mail className="w-8 h-8 text-brand-gold" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-gold bg-brand-gold/10 px-3.5 py-1.5 rounded border border-brand-gold/20 inline-block font-semibold">
                Activation de Compte
              </span>
              <h3 className="font-editorial text-3xl font-light text-brand-travertine pt-1">
                Vérification Email
              </h3>
              <p className="text-xs text-brand-travertine/70 leading-relaxed max-w-xs mx-auto">
                Un code de confirmation à 6 chiffres a été transmis à <span className="font-bold text-white font-mono">{pendingEmailConfirmation}</span>.
              </p>
            </div>

            {activationError && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono">
                {activationError}
              </div>
            )}

            <form onSubmit={handleVerifyEmailConfirmation} className="space-y-6">
              <OtpInput value={activationCode} onChange={setActivationCode} />

              <button
                type="submit"
                disabled={activationCode.length < 6}
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Activer mon Compte</span>
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                className="text-xs text-brand-travertine/60 hover:text-brand-gold transition-colors font-mono inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                <span>
                  {resendTimer > 0 ? `Renvoyer le code dans ${resendTimer}s` : 'Renvoyer un nouveau code par email'}
                </span>
              </button>
            </div>
          </div>
        ) : isStaffPending2FA ? (
          /* ------------------------------------------------------------------------- */
          /* EMAIL 2FA VERIFICATION STEP FOR STAFF                                     */
          /* ------------------------------------------------------------------------- */
          <div className="space-y-6 text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center mx-auto border border-brand-gold/30 shadow-xl">
              <ShieldCheck className="w-9 h-9 text-brand-gold" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-gold bg-brand-gold/10 px-3.5 py-1.5 rounded border border-brand-gold/20 inline-block font-semibold">
                Authentification 2FA Sécurisée
              </span>
              <h3 className="font-editorial text-3xl font-light text-brand-travertine pt-1">
                Code de Sécurité Email
              </h3>
              <p className="text-xs text-brand-travertine/70 leading-relaxed max-w-xs mx-auto">
                Saisissez le code 2FA à 6 chiffres envoyé à <span className="font-bold text-white font-mono">{user?.email}</span>.
              </p>
            </div>

            {twoFactorError && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono">
                {twoFactorError}
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-6">
              <OtpInput value={pinCode} onChange={setPinCode} />

              <button
                type="submit"
                disabled={pinCode.length < 6}
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Valider la Connexion Admin</span>
              </button>
            </form>

            <div className="pt-2 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                className="text-xs text-brand-travertine/60 hover:text-brand-gold transition-colors font-mono inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                <span>
                  {resendTimer > 0 ? `Renvoyer le code dans ${resendTimer}s` : 'Renvoyer un nouveau code par email'}
                </span>
              </button>

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-xs text-brand-travertine/40 hover:text-red-400 font-mono block mx-auto transition-colors"
              >
                Annuler et se déconnecter
              </button>
            </div>
          </div>
        ) : user ? (
          /* Logged In View */
          <div className="space-y-6 text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-3 py-1 rounded">
                Membre : {user.role}
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
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-xl flex items-center justify-center gap-2"
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
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Se Déconnecter</span>
            </button>
          </div>
        ) : (
          /* Login vs Register Switcher View */
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-brand-gold font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portail Membres Villa Regia</span>
              </div>

              {/* Mode Toggle Bar */}
              <div className="flex bg-brand-navy p-1 rounded-xl border border-white/10 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`w-1/2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    mode === 'login' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/60 hover:text-white'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`w-1/2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    mode === 'register' ? 'bg-brand-gold text-brand-navy shadow-md font-bold' : 'text-brand-travertine/60 hover:text-white'
                  }`}
                >
                  Inscription
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono">
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Adresse Email</label>
                  <input
                    type="email"
                    placeholder="votreemail@domaine.tn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
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
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Se Connecter</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleCustomRegister} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Nom & Prénom</label>
                  <input
                    type="text"
                    placeholder="ex: Yassine Triki"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-gold focus:outline-none transition-colors"
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
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
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
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Mot de Passe</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
                    required
                  />
                </div>

                <div className="p-3 rounded-lg bg-brand-gold/10 border border-brand-gold/25 text-[10px] font-mono text-brand-travertine/70 leading-relaxed">
                  <span className="text-brand-gold font-bold block mb-1">Compte Client</span>
                  L'inscription publique crée un compte Client Membre. Les comptes Administrateurs et Staff sont configurés exclusivement par la direction via le tableau de bord sécurisé.
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Créer mon Compte Client</span>
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
