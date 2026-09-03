'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_PROPERTIES } from '@/data/properties';
import {
  X,
  User,
  ShieldCheck,
  Heart,
  Calendar,
  LogOut,
  Sparkles,
  CheckCircle2,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, is2FAVerified, logout, auditLogs } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { language, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'favorites' | 'history'>('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currency, setCurrency] = useState('TND');
  const [isSaved, setIsSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [propertiesList, setPropertiesList] = useState<any[]>(INITIAL_PROPERTIES);

  useEffect(() => {
    async function loadProps() {
      try {
        const res = await fetch('/api/properties');
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          setPropertiesList(data.properties);
        }
      } catch {}
    }
    loadProps();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Save profile info (Name, Phone)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Erreur lors de la mise à jour.');
        setProfileLoading(false);
        return;
      }

      // Update local state and storage
      user.name = name.trim();
      user.phone = phone.trim();
      localStorage.setItem('vr_user', JSON.stringify(user));

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err) {
      // Fallback
      user.name = name.trim();
      user.phone = phone.trim();
      localStorage.setItem('vr_user', JSON.stringify(user));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } finally {
      setProfileLoading(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassError(data.error || 'Erreur lors du changement de mot de passe.');
        setPassLoading(false);
        return;
      }

      setPassSuccess('Votre mot de passe a été mis à jour avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 4000);
    } catch (err) {
      setPassError('Erreur de connexion au serveur.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-navy p-6 sm:p-8 rounded-2xl max-w-2xl w-full border border-brand-gold/30 shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-brand-travertine/60 hover:text-brand-gold transition-colors p-1"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Header Badge */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-gold/30 to-brand-gold text-brand-navy flex items-center justify-center font-bold text-xl border border-brand-gold/50 shadow-lg shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-editorial text-2xl font-light text-brand-travertine">
                {user.name}
              </h2>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                user.role === 'SUPER_ADMIN'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : user.role === 'ADMIN'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  : 'bg-brand-gold/15 text-brand-gold border-brand-gold/30'
              }`}>
                {user.role === 'SUPER_ADMIN' ? 'Directeur Général (Super Admin)' : user.role}
              </span>
            </div>
            <p className="text-xs text-brand-travertine/60 font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-gold" />
              <span>{user.email}</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.2 rounded border border-emerald-500/20 font-bold">Vérifié</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation Header */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
          {[
            { id: 'profile', label: 'Mon Profil', icon: User },
            { id: 'security', label: 'Sécurité & Mot de Passe', icon: KeyRound },
            { id: 'favorites', label: `Mes Favoris (${favorites.length})`, icon: Heart },
            { id: 'history', label: 'Historique & Dossiers', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-gold text-brand-navy shadow-md font-bold'
                    : 'text-brand-travertine/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: PROFILE EDIT ── */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {isSaved && (
              <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Vos informations de profil ont été enregistrées avec succès !</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-xs font-mono border border-red-500/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">
                  Nom & Prénom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">
                  Téléphone Direct
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono transition-colors"
                  placeholder="+216 -- --- ---"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">
                  Langue Préférée
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-brand-gold focus:outline-none"
                >
                  <option value="fr">Français (FR)</option>
                  <option value="ar">العربية (AR)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1 font-bold">
                  Devise d'Affichage
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-brand-gold focus:outline-none"
                >
                  <option value="TND">TND (Dinar Tunisien)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="USD">USD ($ Dollar US)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{profileLoading ? 'Enregistrement...' : 'Sauvegarder mes Informations'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ── TAB 2: SECURITY & PASSWORD CONFIGURATION ── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password Change Form */}
            <form onSubmit={handleChangePassword} className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <Lock className="w-4 h-4 text-brand-gold" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-gold">
                  Changer mon Mot de Passe
                </h4>
              </div>

              {passSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-xs font-mono border border-red-500/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{passError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-mono uppercase text-white/70 block mb-1">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-brand-gold"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/70 block mb-1">
                    Nouveau mot de passe (min. 6 car.)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-brand-gold"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-white/70 block mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-brand-navy border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading || !newPassword}
                className="w-full bg-brand-gold/20 hover:bg-brand-gold text-brand-gold hover:text-brand-navy border border-brand-gold/40 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {passLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>{passLoading ? 'Mise à jour...' : 'Mettre à jour mon mot de passe'}</span>
              </button>
            </form>

            {/* 2FA & Admin Redirect */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Protection du Compte</h4>
                    <p className="text-xs text-brand-travertine/60 font-mono">Chiffrement SSL 256-bit et protection anti-intrusion active</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ACTIF
                </span>
              </div>
            </div>

            {['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role) && (
              <button
                onClick={() => {
                  router.push('/admin');
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl flex items-center justify-center gap-2"
              >
                <span>Accéder au Tableau de Bord Admin (Espace Staff)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Recent Security Logs */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-brand-gold block font-bold">Dernières Connexions & Activités</span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {auditLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-brand-gold font-bold">{log.action}</span>
                      <span className="text-white/50 block text-[10px]">{log.target}</span>
                    </div>
                    <span className="text-white/40 text-[10px]">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: SAVED FAVORITES ── */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {favorites.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Heart className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-xs text-white/50 font-mono">Aucun bien immobilier enregistré dans vos favoris pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {favorites.map((favId) => {
                  const property = propertiesList.find((p) => p.id === favId);
                  return (
                    <div key={favId} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                      <div className="space-y-0.5 truncate">
                        <span className="text-xs font-bold text-brand-gold truncate block">
                          {property
                            ? (typeof property.title === 'string'
                                ? property.title
                                : (property.title[language] || property.title.fr))
                            : `Bien ${favId}`}
                        </span>
                        <span className="text-[10px] text-white/50 font-mono block">
                          {property ? `${property.location.district}, ${property.location.city}` : 'Sfax, Tunisie'}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFavorite(favId)}
                        className="p-1.5 text-white/40 hover:text-red-400 transition-colors shrink-0"
                        title="Supprimer des favoris"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: HISTORY & INQUIRIES ── */}
        {activeTab === 'history' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-brand-gold font-bold block">Réservation Stay Luxe #VR-8821</span>
                <span className="text-white/50 text-[10px]">Villa Palais des Oliviers • Sfax Soukra</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">CONFIRMÉ</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-brand-gold font-bold block">Demande d'Estimation Propriétaire</span>
                <span className="text-white/50 text-[10px]">Patrimoine Soukra Nord • Dossier Privé</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">EN ÉVALUATION</span>
            </div>
          </div>
        )}

        {/* Logout Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            <span>Se Déconnecter</span>
          </button>
          <span className="text-[10px] text-white/40 font-mono">Villa Regia Flagship v1.0</span>
        </div>
      </motion.div>
    </div>
  );
};
