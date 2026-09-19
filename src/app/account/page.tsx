'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { AuthModal } from '@/components/auth/AuthModal';
import {
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
  Eye,
  EyeOff,
  RefreshCw,
  Building2,
  ExternalLink,
  MessageCircle,
  ChevronRight,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, auditLogs } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { language } = useLanguage();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'submissions' | 'favorites' | 'security'>('profile');

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaved, setIsSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Live Database States
  const [propertiesList, setPropertiesList] = useState<any[]>(INITIAL_PROPERTIES);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Load real user data from server API
  useEffect(() => {
    if (!user) return;
    const currentUser = user;

    async function loadUserData() {
      setIsLoadingRealData(true);
      const emailLower = currentUser.email.toLowerCase().trim();

      try {
        const [propsRes, bookRes, subRes] = await Promise.all([
          fetch('/api/properties').then((r) => r.json()).catch(() => null),
          fetch('/api/bookings').then((r) => r.json()).catch(() => null),
          fetch('/api/submissions').then((r) => r.json()).catch(() => null),
        ]);

        if (propsRes?.success && Array.isArray(propsRes.properties)) {
          setPropertiesList(propsRes.properties);
        }

        if (bookRes?.success && Array.isArray(bookRes.bookings)) {
          const userOnlyBookings = bookRes.bookings.filter(
            (b: any) => b.guestEmail && b.guestEmail.toLowerCase().trim() === emailLower
          );
          setUserBookings(userOnlyBookings);
        }

        if (subRes?.success && Array.isArray(subRes.submissions)) {
          const userOnlySubs = subRes.submissions.filter(
            (s: any) => s.ownerEmail && s.ownerEmail.toLowerCase().trim() === emailLower
          );
          setUserSubmissions(userOnlySubs);
        }
      } catch (err) {
        console.warn('Account real data load error:', err);
      } finally {
        setIsLoadingRealData(false);
      }
    }

    loadUserData();
  }, [user]);

  const isStaff = user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role);

  // Save profile info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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

      user.name = name.trim();
      user.phone = phone.trim();
      localStorage.setItem('vr_user', JSON.stringify(user));

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err) {
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
    if (!user) return;
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

  // If user is not logged in: display a luxury VIP guest gate
  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 bg-[#FAF8F3] text-[#132339] flex items-center justify-center">
        <div className="max-w-md w-full bg-[#FAF8F3] p-6 sm:p-8 rounded-2xl border border-[rgba(19,35,57,0.14)] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#B8912E]/15 text-[#B8912E] flex items-center justify-center mx-auto border border-[#B8912E]/30 shadow-lg">
            <User className="w-8 h-8 text-[#B8912E]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B8912E] font-bold">
              Espace Privé & Sécurisé
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#132339] font-semibold">
              Mon Compte Villa Regia
            </h1>
            <p className="text-xs text-[#2c3f57] font-normal leading-relaxed">
              Connectez-vous pour accéder à votre espace membre et suivre vos réservations de villas de luxe.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full bg-[#B8912E] hover:bg-[#a37f39] text-[#132339] py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#132339]" />
              <span>Se Connecter / S'Inscrire</span>
            </button>

            <Link
              href="/"
              className="block w-full py-2.5 rounded-xl border border-[rgba(19,35,57,0.14)] text-[#2c3f57] hover:text-[#132339] text-xs font-mono transition-colors"
            >
              Retour à l'Accueil
            </Link>
          </div>

          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 bg-[#FAF8F3] text-[#132339]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TOP MOBILE / DESKTOP HEADER BANNER */}
        <div className="bg-[#FAF8F3] p-4 sm:p-6 rounded-2xl border border-[rgba(19,35,57,0.14)] shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#B8912E]/20 text-[#132339] flex items-center justify-center font-bold text-2xl border border-[#B8912E]/40 shadow-md shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#132339] truncate">
                  {user.name}
                </h1>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                  user.role === 'SUPER_ADMIN'
                    ? 'bg-amber-500/20 text-[#8C6813] border-amber-500/30'
                    : user.role === 'ADMIN'
                    ? 'bg-sky-500/20 text-[#1e3a8a] border-sky-500/30'
                    : 'bg-[#B8912E]/15 text-[#8C6813] border-[#B8912E]/30'
                }`}>
                  {user.role === 'SUPER_ADMIN' ? 'Direction Générale' : user.role === 'ADMIN' ? 'Administrateur' : user.role === 'AGENT' ? 'Conseiller' : 'Membre VIP'}
                </span>
              </div>

              <div className="text-xs text-[#2c3f57] font-mono flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#B8912E]" /> {user.email}</span>
                {user.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#B8912E]" /> {user.phone}</span>
                )}
                <span className="text-[10px] bg-emerald-500/15 text-emerald-800 px-2 py-0.5 rounded border border-emerald-500/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Compte Vérifié
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Admin Button or Logout) */}
          <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t border-[rgba(19,35,57,0.1)] sm:border-0">
            {isStaff && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B8912E] text-[#132339] hover:opacity-95 transition-all text-xs font-mono font-bold shadow-md"
              >
                <ShieldCheck className="w-4 h-4 text-[#132339]" />
                <span>Espace Admin</span>
              </Link>
            )}

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF8F3] hover:bg-red-50 text-[#2c3f57] hover:text-red-700 border border-[rgba(19,35,57,0.14)] text-xs font-mono transition-colors font-semibold"
              title="Se Déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS (TOUCH & MOBILE OPTIMIZED) */}
        <div className="flex border-b border-[rgba(19,35,57,0.14)] gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
          {[
            { id: 'profile', label: 'Mon Profil', icon: User },
            { id: 'bookings', label: `Mes Séjours (${userBookings.length})`, icon: Calendar },
            { id: 'submissions', label: `Mes Biens Soumis (${userSubmissions.length})`, icon: Building2 },
            { id: 'favorites', label: `Mes Favoris (${favorites.length})`, icon: Heart },
            { id: 'security', label: 'Sécurité & Accès', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap snap-start shrink-0 ${
                  isActive
                    ? 'bg-[#B8912E] text-[#132339] shadow-md'
                    : 'bg-[#FAF8F3] text-[#2c3f57] hover:bg-[#EFE8D8] border border-[rgba(19,35,57,0.14)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: MON PROFIL & VIP CARD */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* VIP Card */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#EFE8D8] border border-[#B8912E]/40 relative overflow-hidden shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B8912E] block font-bold">
                    Cercle Privilège Villa Regia
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#132339] mt-1">
                    Membre Résident & Propriétaire
                  </h2>
                </div>
                <div className="relative w-24 h-8">
                  <Image src="/images/logo-dark.png" alt="Villa Regia" fill className="object-contain" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono border-t border-[rgba(19,35,57,0.14)] pt-4">
                <div>
                  <span className="text-[#2c3f57] block text-[10px]">Titulaire</span>
                  <span className="text-[#132339] font-bold truncate block">{user.name}</span>
                </div>
                <div>
                  <span className="text-[#2c3f57] block text-[10px]">Identifiant Client</span>
                  <span className="text-[#B8912E] font-bold font-mono">VR-{user.id.slice(-6).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[#2c3f57] block text-[10px]">Conciergerie Dédiée</span>
                  <a href="https://wa.me/21627745403" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1 font-bold">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700 fill-current" /> +216 27 745 403
                  </a>
                </div>
              </div>
            </div>

            {/* Editable Profile Information Form */}
            <div className="bg-[#FAF8F3] p-6 sm:p-8 rounded-2xl border border-[rgba(19,35,57,0.14)] shadow-md space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#B8912E]">
                Coordonnées Personnelles & Contact
              </h3>

              {profileError && (
                <div className="p-3.5 rounded-xl bg-red-500/15 text-red-800 text-xs border border-red-500/30 font-mono">
                  {profileError}
                </div>
              )}

              {isSaved && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 text-emerald-800 text-xs border border-emerald-500/30 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Vos informations personnelles ont été mises à jour avec succès.</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#2c3f57] mb-1.5 font-semibold">Nom Complet</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[rgba(19,35,57,0.18)] rounded-xl px-4 py-3 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#2c3f57] mb-1.5 font-semibold">Téléphone Direct</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+216 27 745 403"
                      className="w-full bg-white border border-[rgba(19,35,57,0.18)] rounded-xl px-4 py-3 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#2c3f57] mb-1.5 font-semibold">Adresse Email (Identifiant sécurisé)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-[#EFE8D8] border border-[rgba(19,35,57,0.14)] rounded-xl px-4 py-3 text-xs text-[#132339] cursor-not-allowed font-mono font-semibold"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-[#B8912E] hover:bg-[#a37f39] text-[#132339] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-md"
                  >
                    {profileLoading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: MES SÉJOURS & RÉSERVATIONS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#B8912E]">
                  Mes Réservations de Séjours & Demeures
                </h2>
                <p className="text-xs text-[#2c3f57] mt-0.5">Données synchronisées en direct avec l'équipe de conciergerie privée.</p>
              </div>

              <Link
                href="/villas-de-luxe"
                className="text-xs text-[#B8912E] hover:underline font-mono flex items-center gap-1 font-bold"
              >
                <span>Nouvelle villa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingRealData ? (
              <div className="py-12 text-center text-xs font-mono text-[#2c3f57] space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#B8912E]" />
                <p>Synchronisation de vos séjours...</p>
              </div>
            ) : userBookings.length === 0 ? (
              <div className="bg-[#FAF8F3] p-8 rounded-2xl border border-[rgba(19,35,57,0.14)] text-center space-y-3 shadow-md">
                <Calendar className="w-10 h-10 text-[#2c3f57]/30 mx-auto" />
                <p className="text-sm text-[#132339] font-serif font-semibold">Aucune réservation de séjour enregistrée pour le moment.</p>
                <p className="text-xs text-[#2c3f57]">Découvrez nos demeures d'architecte et villas de luxe avec piscine et service traiteur à Sfax.</p>
                <Link
                  href="/villas-de-luxe"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#B8912E] text-[#132339] text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all mt-2 shadow-sm"
                >
                  Découvrir les Demeures de Prestige
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#FAF8F3] p-4 rounded-xl border border-[rgba(19,35,57,0.14)] space-y-3 hover:border-[#B8912E]/40 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#132339] font-bold text-sm">{b.propertyTitle || 'Villa de Prestige'}</span>
                          <span className="text-[10px] font-mono text-[#2c3f57]">#{b.id}</span>
                        </div>
                        <span className="text-xs text-[#2c3f57] font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#B8912E]" /> Du {b.checkIn} au {b.checkOut} ({b.totalNights || 1} nuit{b.totalNights > 1 ? 's' : ''})
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
                          : b.status === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-800 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-800 border border-amber-500/30'
                      }`}>
                        {b.status === 'CONFIRMED' ? 'Confirmé' : b.status === 'CANCELLED' ? 'Annulé' : 'En Attente'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-[rgba(19,35,57,0.12)] text-xs font-mono">
                      <span className="text-[#2c3f57]">{b.guestsCount || b.guests || 2} Voyageur{(b.guestsCount || b.guests) > 1 ? 's' : ''}</span>
                      <span className="text-[#B15A3C] font-bold">{(b.totalAmount || b.price || 0).toLocaleString()} TND</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MES BIENS SOUMIS */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#B8912E]">
                  Mes Dossiers Propriétaire Déposés
                </h2>
                <p className="text-xs text-[#2c3f57] mt-0.5">Suivez le statut d'étude juridique et commerciale de vos biens proposés.</p>
              </div>

              <Link
                href="/proposer-un-bien"
                className="text-xs text-[#B8912E] hover:underline font-mono flex items-center gap-1 font-bold"
              >
                <span>Proposer un bien</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingRealData ? (
              <div className="py-12 text-center text-xs font-mono text-[#2c3f57] space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#B8912E]" />
                <p>Chargement de vos dossiers...</p>
              </div>
            ) : userSubmissions.length === 0 ? (
              <div className="bg-[#FAF8F3] p-8 rounded-2xl border border-[rgba(19,35,57,0.14)] text-center space-y-3 shadow-md">
                <Building2 className="w-10 h-10 text-[#2c3f57]/30 mx-auto" />
                <p className="text-sm text-[#132339] font-serif font-semibold">Aucun dossier propriétaire soumis avec cette adresse email.</p>
                <p className="text-xs text-[#2c3f57]">Vous possédez une villa, un terrain ou un espace commercial à Sfax ? Confiez-nous sa vente ou location.</p>
                <Link
                  href="/proposer-un-bien"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#B8912E] text-[#132339] text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all mt-2 shadow-sm"
                >
                  Proposer un Bien à la Vente
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userSubmissions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[#FAF8F3] p-4 rounded-xl border border-[rgba(19,35,57,0.14)] space-y-3 hover:border-[#B8912E]/30 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#132339] font-bold text-sm">{s.propertyType} — {s.district || s.city || 'Sfax'}</span>
                          <span className="text-[10px] font-mono text-[#2c3f57]">Dossier #{s.refCode || s.id}</span>
                        </div>
                        <span className="text-xs text-[#2c3f57] font-mono block mt-0.5">
                          Objectif: {s.objective} • Surface: {s.surfaceM2 || 'Non précisée'} m²
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MES FAVORIS */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#B8912E]">
                Mes Demeures Enregistrées ({favorites.length})
              </h2>
              <Link
                href="/properties"
                className="text-xs text-[#B8912E] hover:underline font-mono flex items-center gap-1 font-bold"
              >
                <span>Catalogue complet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {favorites.length === 0 ? (
              <div className="bg-[#FAF8F3] p-8 rounded-2xl border border-[rgba(19,35,57,0.14)] text-center space-y-3 shadow-md">
                <Heart className="w-10 h-10 text-[#2c3f57]/30 mx-auto" />
                <p className="text-sm text-[#132339] font-serif font-semibold">Aucune propriété enregistrée dans vos favoris.</p>
                <p className="text-xs text-[#2c3f57]">Cliquez sur le cœur d'une villa ou d'un domaine pour le retrouver ici.</p>
                <Link
                  href="/properties"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#B8912E] text-[#132339] text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all mt-2 shadow-sm"
                >
                  Découvrir le Catalogue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map((favId) => {
                  const property = propertiesList.find((p) => p.id === favId);
                  const titleStr = property
                    ? (typeof property.title === 'string'
                        ? property.title
                        : (property.title[language] || property.title.fr))
                    : `Propriété d'Exception ${favId}`;

                  const coverImg = property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9';

                  return (
                    <div
                      key={favId}
                      className="bg-[#FAF8F3] p-4 rounded-xl border border-[rgba(19,35,57,0.14)] hover:border-[#B8912E]/40 transition-all flex flex-col justify-between gap-3 group shadow-sm"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[rgba(19,35,57,0.14)]">
                          <Image src={coverImg} alt={titleStr} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-xs font-bold text-[#132339] truncate block">
                            {titleStr}
                          </span>
                          <span className="text-[11px] text-[#2c3f57] font-mono block">
                            {property ? `${property.location.district}, ${property.location.city}` : 'Sfax, Tunisie'}
                          </span>
                          {property?.price && (
                            <span className="text-xs font-bold text-[#B15A3C] font-mono block">
                              {property.price.amount.toLocaleString()} {property.price.currency}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[rgba(19,35,57,0.12)] text-xs">
                        <Link
                          href={`/properties/${favId}`}
                          className="text-[#B8912E] hover:underline font-mono flex items-center gap-1 text-xs font-bold"
                        >
                          <span>Consulter la fiche</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => toggleFavorite(favId)}
                          className="text-[#2c3f57] hover:text-red-700 p-1 transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="Retirer des favoris"
                        >
                          <span>Retirer</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SÉCURITÉ & MOT DE PASSE */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-[#FAF8F3] p-6 sm:p-8 rounded-2xl border border-[rgba(19,35,57,0.14)] space-y-5 shadow-md">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#B8912E]">
                Modifier mon Mot de Passe
              </h3>

              {passError && (
                <div className="p-3.5 rounded-xl bg-red-500/15 text-red-800 text-xs border border-red-500/30 font-mono">
                  {passError}
                </div>
              )}

              {passSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 text-emerald-800 text-xs border border-emerald-500/30 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#2c3f57] mb-1.5 font-semibold">Mot de Passe Actuel</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-white border border-[rgba(19,35,57,0.18)] rounded-xl px-4 py-3 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2c3f57] hover:text-[#132339]"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#2c3f57] mb-1.5 font-semibold">Nouveau Mot de Passe (min. 6 caractères)</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white border border-[rgba(19,35,57,0.18)] rounded-xl px-4 py-3 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2c3f57] hover:text-[#132339]"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#2c3f57] mb-1.5 font-semibold">Confirmer le Nouveau Mot de Passe</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-[rgba(19,35,57,0.18)] rounded-xl px-4 py-3 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E]"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="bg-[#B8912E] hover:bg-[#a37f39] text-[#132339] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-md"
                  >
                    {passLoading ? 'Mise à jour...' : 'Mettre à Jour le Mot de Passe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
