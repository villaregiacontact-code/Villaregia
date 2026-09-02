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
  ArrowLeft,
  UserPlus,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      const nextDigits = [...digits];
      nextDigits[index] = '';
      onChange(nextDigits.join(''));
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleanVal[cleanVal.length - 1];
    const newCode = nextDigits.join('');
    onChange(newCode);

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
    cancelEmailVerification,
    logout,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'confirm-email'>('login');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Codes
  const [pinCode, setPinCode] = useState<string>('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  const [activationCode, setActivationCode] = useState<string>('');
  const [activationError, setActivationError] = useState<string | null>(null);

  // Resend Timer State
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Register Form State (CLIENT role only)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

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

    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }
    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      if (result.requires2FA) {
        setResendTimer(60);
      } else {
        // Direct login success
        if (result.user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(result.user.role)) {
          router.push('/admin');
        }
        onClose();
      }
    } else {
      setError(result.error || 'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
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
    setIsLoading(true);
    const result = await verifyEmailCode(activationCode);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setActivationError(result.error || 'Code de confirmation invalide ou expiré.');
    }
  };

  const handleCustomRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || regName.trim().length < 2) {
      setError('Veuillez renseigner votre nom complet (minimum 2 caractères).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    const result = await register(regName, regEmail, regPhone || '+216 -- --- ---', 'CLIENT', regPassword);
    setIsLoading(false);

    if (result.success) {
      setMode('confirm-email');
      setResendTimer(60);
    } else {
      setError(result.error || "Erreur lors de l'inscription.");
    }
  };

  const handleResendCode = () => {
    if (resendTimer === 0) {
      setResendTimer(60);
    }
  };

  const handleCancelConfirmation = () => {
    cancelEmailVerification();
    setMode('register');
    setError(null);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const regPassStrength = getPasswordStrength(regPassword);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-navy p-8 rounded-2xl max-w-md w-full border border-brand-gold/30 shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto"
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
                Sécurité & Vérification
              </span>
              <h3 className="font-editorial text-3xl font-light text-brand-travertine pt-1">
                Activation de Compte
              </h3>
              <p className="text-xs text-brand-travertine/70 leading-relaxed max-w-xs mx-auto">
                Un code de sécurité à 6 chiffres a été envoyé à :<br />
                <span className="font-bold text-brand-gold font-mono break-all">{pendingEmailConfirmation}</span>
              </p>
            </div>

            {activationError && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{activationError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyEmailConfirmation} className="space-y-6">
              <OtpInput value={activationCode} onChange={setActivationCode} />

              <button
                type="submit"
                disabled={activationCode.length < 6 || isLoading}
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Vérification...' : 'Activer mon Compte'}</span>
              </button>
            </form>

            <div className="pt-2 text-center space-y-3">
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

              <div>
                <button
                  type="button"
                  onClick={handleCancelConfirmation}
                  className="text-[11px] text-brand-travertine/40 hover:text-brand-gold font-mono transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Modifier mon adresse email</span>
                </button>
              </div>
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
              <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{twoFactorError}</span>
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
          /* ------------------------------------------------------------------------- */
          /* LOGGED-IN PROFILE VIEW                                                    */
          /* ------------------------------------------------------------------------- */
          <div className="space-y-6 text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded font-bold ${
                user.role === 'SUPER_ADMIN'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : user.role === 'ADMIN'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
              }`}>
                {user.role === 'SUPER_ADMIN' ? 'Directeur Général (Super Admin)' : `Membre : ${user.role}`}
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
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all"
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
          /* ------------------------------------------------------------------------- */
          /* LOGIN VS REGISTER TABS                                                    */
          /* ------------------------------------------------------------------------- */
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-brand-gold font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portail Sécurisé Villa Regia</span>
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
              <div className="p-3.5 rounded-xl bg-red-500/20 text-red-300 text-xs border border-red-500/30 font-mono flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {mode === 'login' ? (
              /* ── LOGIN FORM ── */
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="votreemail@domaine.tn"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-3 pl-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono uppercase text-brand-gold block">
                      Mot de passe
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-brand-gold transition-colors"
                      aria-label="Afficher le mot de passe"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-brand-travertine/60 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                    Chiffrement SSL 256-bit
                  </span>
                  <span>Accès Client & Staff</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Connexion en cours...' : 'Se Connecter'}</span>
                </button>
              </form>
            ) : (
              /* ── REGISTER FORM ── */
              <form onSubmit={handleCustomRegister} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">
                    Nom & Prénom
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ex: Mohamed Trabelsi"
                      value={regName}
                      onChange={(e) => { setRegName(e.target.value); setError(null); }}
                      className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:border-brand-gold focus:outline-none transition-colors"
                      required
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="votreemail@domaine.tn"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); setError(null); }}
                      className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">
                    Téléphone Direct
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="+216 98 --- ---"
                      value={regPhone}
                      onChange={(e) => { setRegPhone(e.target.value); setError(null); }}
                      className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">
                    Mot de Passe (minimum 6 caractères)
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={regPassword}
                      onChange={(e) => { setRegPassword(e.target.value); setError(null); }}
                      className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-brand-gold transition-colors"
                      aria-label="Afficher le mot de passe"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {regPassword && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex gap-1 h-1">
                        <div className={`flex-1 rounded-full ${regPassStrength >= 1 ? (regPassStrength < 3 ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-white/10'}`} />
                        <div className={`flex-1 rounded-full ${regPassStrength >= 3 ? (regPassStrength < 4 ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-white/10'}`} />
                        <div className={`flex-1 rounded-full ${regPassStrength >= 4 ? 'bg-emerald-400' : 'bg-white/10'}`} />
                      </div>
                      <span className="text-[9px] font-mono text-brand-travertine/60 block">
                        Sécurité : {regPassStrength < 2 ? 'Faible' : regPassStrength < 4 ? 'Moyen' : 'Sécurisé'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">
                    Confirmer le Mot de Passe
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => { setRegConfirmPassword(e.target.value); setError(null); }}
                      className={`w-full bg-brand-navy border rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none font-mono transition-colors ${
                        regConfirmPassword && regConfirmPassword !== regPassword
                          ? 'border-red-500/60 focus:border-red-500'
                          : regConfirmPassword && regConfirmPassword === regPassword
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : 'border-white/20 focus:border-brand-gold'
                      }`}
                      required
                    />
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-brand-gold/10 border border-brand-gold/25 text-[10px] font-mono text-brand-travertine/70 leading-relaxed">
                  <span className="text-brand-gold font-bold block mb-0.5">Inscription Client Membre</span>
                  L'inscription crée un compte Client privé. Les comptes Staff sont configurés par la direction via le tableau de bord sécurisé.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Création en cours...' : 'Créer mon Compte Client'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
