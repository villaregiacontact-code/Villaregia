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
  const inputRef = useRef<HTMLInputElement>(null);
  const cleanVal = (value || '').replace(/\D/g, '').slice(0, 6);

  return (
    <div
      className="relative max-w-xs mx-auto my-4 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Real underlying input with opacity 0 so native keyboard, autofill, backspace, and paste always work 100% */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={cleanVal}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-text"
        autoFocus
      />

      {/* Visual 6-box responsive display */}
      <div className="flex justify-between items-center gap-2">
        {Array.from({ length: 6 }).map((_, idx) => {
          const char = cleanVal[idx] || '';
          const isCurrent = cleanVal.length === idx;
          return (
            <div
              key={idx}
              className={`w-11 h-14 flex items-center justify-center text-2xl font-bold font-mono rounded-xl border transition-all shadow-sm ${
                char
                  ? 'bg-[#1A1615] border-[#B8912E] text-[#B8912E]'
                  : isCurrent
                  ? 'bg-[#1A1615] border-[#B8912E] ring-2 ring-[#B8912E]/40 text-white animate-pulse'
                  : 'bg-white border-[#1A1615]/20 text-[#1A1615]/40'
              }`}
            >
              {char || (isCurrent ? '|' : '·')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const {
    user,
    is2FAVerified,
    pendingEmailConfirmation,
    lastDispatchedEmailNotice,
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
      window.location.href = '/admin';
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
        // Direct login success: Staff goes to admin, Client gets immediate access to account
        if (result.user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(result.user.role)) {
          window.location.href = '/admin';
          return;
        }
        window.location.href = '/account';
        return;
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
      if (user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role)) {
        window.location.href = '/admin';
        return;
      }
      window.location.href = '/account';
      return;
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
      if (result.user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(result.user.role)) {
        window.location.href = '/admin';
        return;
      }
      window.location.href = '/account';
      return;
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailRegex.test(regEmail.trim())) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!regPhone.trim() || regPhone.trim().length < 8) {
      setError('Veuillez renseigner un numéro de téléphone valide (minimum 8 chiffres).');
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
    const result = await register(regName.trim(), regEmail.trim(), regPhone.trim(), 'CLIENT', regPassword);
    setIsLoading(false);

    if (result.success) {
      setMode('confirm-email');
      setResendTimer(60);
    } else {
      setError(result.error || "Erreur lors de l'inscription.");
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setError(null);
    if (pendingEmailConfirmation) {
      let pendingObj: any = null;
      try {
        const raw = localStorage.getItem(`vr_pending_${pendingEmailConfirmation}`);
        if (raw) pendingObj = JSON.parse(raw);
      } catch {}

      const res = await register(
        pendingObj?.name || 'Client Villa Regia',
        pendingEmailConfirmation,
        pendingObj?.phone || '+216 27 745 403',
        'CLIENT',
        pendingObj?.password || 'VillaRegia.2026'
      );
      if (res.success) {
        setResendTimer(60);
      } else {
        setError(res.error || 'Erreur lors du renvoi du code.');
      }
    }
    setIsLoading(false);
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FAF8F3] text-[#1A1615] p-5 sm:p-8 rounded-2xl max-w-md w-full border border-[rgba(26,22,21,0.14)] shadow-2xl relative space-y-5 sm:space-y-6 max-h-[94vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 text-[#443E3B] hover:text-[#1A1615] transition-colors p-1"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'confirm-email' ? (
          /* ------------------------------------------------------------------------- */
          /* EMAIL CONFIRMATION CODE STEP                                              */
          /* ------------------------------------------------------------------------- */
          <div className="space-y-6 text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-[#1A1615] text-[#B8912E] flex items-center justify-center mx-auto border border-[#B8912E]/40 shadow-xl">
              <Mail className="w-8 h-8 text-[#B8912E]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B8912E] bg-[#EFE8D8] px-3.5 py-1.5 rounded border border-[rgba(26,22,21,0.15)] inline-block font-semibold">
                Sécurité & Vérification
              </span>
              <h3 className="font-editorial text-3xl font-light text-[#1A1615] pt-1">
                Activation de Compte
              </h3>
              <p className="text-xs text-[#443E3B] leading-relaxed max-w-xs mx-auto">
                Un code de sécurité à 6 chiffres a été envoyé à :<br />
                <span className="font-bold text-[#1A1615] font-mono break-all">{pendingEmailConfirmation}</span>
              </p>
            </div>

            {activationError && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-700 text-xs border border-red-500/25 font-mono flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{activationError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyEmailConfirmation} className="space-y-6">
              <OtpInput value={activationCode} onChange={setActivationCode} />

              <p className="text-[11px] font-mono text-[#443E3B]/80 text-center leading-relaxed">
                Un code à 6 chiffres vous a été envoyé par email. Veuillez vérifier votre boîte de réception (et vos courriers indésirables / spams).
              </p>

              <button
                type="submit"
                disabled={activationCode.length < 6 || isLoading}
                className="w-full bg-[#1A1615] hover:bg-[#2D2623] text-[#FAF8F3] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#B8912E]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#B8912E]" />
                )}
                <span>{isLoading ? 'Vérification...' : 'Valider le Code à 6 Chiffres'}</span>
              </button>

              <div className="flex items-center gap-3 text-[#443E3B]/40 text-[10px] font-mono uppercase tracking-wider pt-2">
                <div className="flex-1 h-px bg-[#1A1615]/10" />
                <span>Ou</span>
                <div className="flex-1 h-px bg-[#1A1615]/10" />
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role)) {
                    router.push('/admin');
                  }
                }}
                className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 border border-emerald-600/25 py-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Accéder Directement à mon Compte</span>
              </button>
            </form>

            <div className="pt-2 text-center space-y-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                className="text-xs text-[#443E3B] hover:text-[#1A1615] transition-colors font-mono inline-flex items-center gap-1.5 disabled:opacity-50 font-medium"
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
                  className="text-[11px] text-[#443E3B]/70 hover:text-[#1A1615] font-mono transition-colors inline-flex items-center gap-1"
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
            <div className="w-16 h-16 rounded-full bg-[#1A1615] text-[#B8912E] flex items-center justify-center mx-auto border border-[#B8912E]/40 shadow-xl">
              <ShieldCheck className="w-9 h-9 text-[#B8912E]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B8912E] bg-[#EFE8D8] px-3.5 py-1.5 rounded border border-[rgba(26,22,21,0.15)] inline-block font-semibold">
                Authentification 2FA Sécurisée
              </span>
              <h3 className="font-editorial text-3xl font-light text-[#1A1615] pt-1">
                Code de Sécurité Email
              </h3>
              <p className="text-xs text-[#443E3B] leading-relaxed max-w-xs mx-auto">
                Saisissez le code 2FA à 6 chiffres envoyé à <span className="font-bold text-[#1A1615] font-mono">{user?.email}</span>.
              </p>
            </div>

            {twoFactorError && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-700 text-xs border border-red-500/25 font-mono flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{twoFactorError}</span>
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-6">
              <OtpInput value={pinCode} onChange={setPinCode} />

              <p className="text-[11px] font-mono text-[#443E3B]/80 text-center leading-relaxed">
                Code de sécurité à 6 chiffres transmis par email sécurisé.
              </p>

              <button
                type="submit"
                disabled={pinCode.length < 6}
                className="w-full bg-[#1A1615] hover:bg-[#2D2623] text-[#FAF8F3] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-[#B8912E]" />
                <span>Valider la Connexion Admin</span>
              </button>
            </form>

            <div className="pt-2 border-t border-[rgba(26,22,21,0.1)] space-y-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                className="text-xs text-[#443E3B] hover:text-[#1A1615] transition-colors font-mono inline-flex items-center gap-1.5 disabled:opacity-50 font-medium"
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
                className="text-xs text-red-600 hover:text-red-700 font-mono block mx-auto transition-colors font-semibold"
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
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded font-bold ${
                user.role === 'SUPER_ADMIN'
                  ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                  : user.role === 'ADMIN'
                  ? 'bg-sky-500/15 text-sky-800 border border-sky-500/30'
                  : 'bg-[#1A1615] text-[#B8912E] border border-[#B8912E]/40'
              }`}>
                {user.role === 'SUPER_ADMIN' ? 'Directeur Général (Super Admin)' : `Membre : ${user.role}`}
              </span>
              <h3 className="font-editorial text-2xl font-light text-[#1A1615] pt-2">
                {user.name}
              </h3>
              <p className="text-xs text-[#443E3B] font-mono">{user.email}</p>
            </div>

            {['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role) && (
              <button
                onClick={() => {
                  router.push('/admin');
                  onClose();
                }}
                className="w-full bg-[#1A1615] hover:bg-[#2D2623] text-[#FAF8F3] font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>Accéder au Tableau de Bord Admin</span>
                <ArrowRight className="w-4 h-4 text-[#B8912E]" />
              </button>
            )}

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-700 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500/25 transition-colors"
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
            <div className="border-b border-[rgba(26,22,21,0.1)] pb-4 text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-[#1A1615] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#B8912E]" />
                <span>Portail Sécurisé Villa Regia</span>
              </div>

              {/* Mode Toggle Bar */}
              <div className="flex bg-[#EFE8D8] p-1 rounded-xl border border-[rgba(26,22,21,0.12)] max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`w-1/2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    mode === 'login' ? 'bg-[#1A1615] text-[#FAF8F3] shadow-md font-bold' : 'text-[#443E3B] hover:text-[#1A1615]'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`w-1/2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    mode === 'register' ? 'bg-[#1A1615] text-[#FAF8F3] shadow-md font-bold' : 'text-[#443E3B] hover:text-[#1A1615]'
                  }`}
                >
                  Inscription
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 text-red-700 text-xs border border-red-500/25 font-mono flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {mode === 'login' ? (
              /* ── LOGIN FORM ── */
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#1A1615] font-bold block mb-1">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="votreemail@domaine.tn"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      className="w-full bg-white border border-[#1A1615]/20 rounded-xl px-4 py-3 pl-10 text-xs text-[#1A1615] focus:border-[#B8912E] focus:outline-none font-mono transition-colors shadow-sm"
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1615]/50" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono uppercase text-[#1A1615] font-bold block">
                      Mot de passe
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      className="w-full bg-white border border-[#1A1615]/20 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-[#1A1615] focus:border-[#B8912E] focus:outline-none font-mono transition-colors shadow-sm"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1615]/50" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1A1615]/40 hover:text-[#1A1615] transition-colors"
                      aria-label="Afficher le mot de passe"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#443E3B] pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B8912E]" />
                    Chiffrement SSL 256-bit
                  </span>
                  <span className="font-medium">Accès Client & Staff</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1A1615] hover:bg-[#2D2623] text-[#FAF8F3] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#B8912E]" />
                  ) : (
                    <Send className="w-4 h-4 text-[#B8912E]" />
                  )}
                  <span>{isLoading ? 'Connexion en cours...' : 'Se Connecter'}</span>
                </button>
              </form>
            ) : (
              /* ── REGISTER FORM ── */
              <form onSubmit={handleCustomRegister} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#1A1615] font-bold block mb-1">
                    Nom & Prénom
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ex: Mohamed Trabelsi"
                      value={regName}
                      onChange={(e) => { setRegName(e.target.value); setError(null); }}
                      className="w-full bg-white border border-[#1A1615]/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-[#1A1615] focus:border-[#B8912E] focus:outline-none transition-colors shadow-sm"
                      required
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1615]/50" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#1A1615] font-bold block mb-1">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="votreemail@domaine.tn"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); setError(null); }}
                      className="w-full bg-white border border-[#1A1615]/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-[#1A1615] focus:border-[#B8912E] focus:outline-none font-mono transition-colors shadow-sm"
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1615]/50" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#1A1615] font-bold block mb-1">
                    Téléphone Direct
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="+216 98 --- ---"
                      value={regPhone}
                      onChange={(e) => { setRegPhone(e.target.value); setError(null); }}
                      className="w-full bg-white border border-[#1A1615]/20 rounded-xl px-4 py-2.5 pl-10 text-xs text-[#1A1615] focus:border-[#B8912E] focus:outline-none font-mono transition-colors shadow-sm"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1615]/50" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#1A1615] font-bold block mb-1">
                    Mot de Passe (minimum 6 caractères)
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={regPassword}
                      onChange={(e) => { setRegPassword(e.target.value); setError(null); }}
                      className="w-full bg-white border border-[#1A1615]/20 rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-[#1A1615] focus:border-[#B8912E] focus:outline-none font-mono transition-colors shadow-sm"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1615]/50" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1A1615]/40 hover:text-[#1A1615] transition-colors"
                      aria-label="Afficher le mot de passe"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {regPassword && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex gap-1 h-1">
                        <div className={`flex-1 rounded-full ${regPassStrength >= 1 ? (regPassStrength < 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-[#1A1615]/10'}`} />
                        <div className={`flex-1 rounded-full ${regPassStrength >= 3 ? (regPassStrength < 4 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-[#1A1615]/10'}`} />
                        <div className={`flex-1 rounded-full ${regPassStrength >= 4 ? 'bg-emerald-500' : 'bg-[#1A1615]/10'}`} />
                      </div>
                      <span className="text-[9px] font-mono text-[#443E3B] block font-medium">
                        Sécurité : {regPassStrength < 2 ? 'Faible' : regPassStrength < 4 ? 'Moyen' : 'Sécurisé'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#1A1615] font-bold block mb-1">
                    Confirmer le Mot de Passe
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => { setRegConfirmPassword(e.target.value); setError(null); }}
                      className={`w-full bg-white border rounded-xl px-4 py-2.5 pl-10 text-xs text-[#1A1615] focus:outline-none font-mono transition-colors shadow-sm ${
                        regConfirmPassword && regConfirmPassword !== regPassword
                          ? 'border-red-500/60 focus:border-red-500'
                          : regConfirmPassword && regConfirmPassword === regPassword
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : 'border-[#1A1615]/20 focus:border-[#B8912E]'
                      }`}
                      required
                    />
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1615]/50" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#EFE8D8] border border-[rgba(26,22,21,0.12)] text-[10px] font-mono text-[#443E3B] leading-relaxed">
                  <span className="text-[#1A1615] font-bold block mb-0.5">Inscription Client Membre</span>
                  L'inscription crée un compte Client privé. Les comptes Staff sont configurés par la direction via le tableau de bord sécurisé.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1A1615] hover:bg-[#2D2623] text-[#FAF8F3] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#B8912E]" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-[#B8912E]" />
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
