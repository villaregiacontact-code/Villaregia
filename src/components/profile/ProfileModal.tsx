'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  Building2,
  ExternalLink,
  MessageCircle,
  FileText,
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

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'submissions' | 'favorites' | 'security'>('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
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

  // Live data states
  const [propertiesList, setPropertiesList] = useState<any[]>(INITIAL_PROPERTIES);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [userLeads, setUserLeads] = useState<any[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);

  // Fetch all live properties and user's specific records from DB
  useEffect(() => {
    if (!isOpen || !user) return;
    const currentUser = user;

    async function loadUserData() {
      setIsLoadingRealData(true);
      const emailLower = currentUser.email.toLowerCase().trim();

      try {
        const [propsRes, bookRes, subRes, crmRes] = await Promise.all([
          fetch('/api/properties').then((r) => r.json()).catch(() => null),
          fetch('/api/bookings').then((r) => r.json()).catch(() => null),
          fetch('/api/submissions').then((r) => r.json()).catch(() => null),
          fetch('/api/admin/crm').then((r) => r.json()).catch(() => null),
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

        if (crmRes?.success && Array.isArray(crmRes.leads)) {
          const userOnlyLeads = crmRes.leads.filter(
            (l: any) => l.email && l.email.toLowerCase().trim() === emailLower
          );
          setUserLeads(userOnlyLeads);
        }
      } catch (err) {
        console.warn('Profile real data load error:', err);
      } finally {
        setIsLoadingRealData(false);
      }
    }

    loadUserData();
  }, [isOpen, user]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role);

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FAF8F3] text-[#132339] p-4 sm:p-8 rounded-2xl max-w-3xl w-full border border-[rgba(19,35,57,0.14)] shadow-2xl relative space-y-5 sm:space-y-6 max-h-[94vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 text-[#2c3f57] hover:text-[#132339] transition-colors p-1"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Modal Header & User Badge */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#B8912E]/30 to-[#B8912E] text-[#132339] flex items-center justify-center font-bold text-xl border border-[#B8912E]/50 shadow-lg shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-editorial text-2xl font-light text-[#132339]">
                  {user.name}
                </h2>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                  user.role === 'SUPER_ADMIN'
                    ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                    : user.role === 'ADMIN'
                    ? 'bg-sky-500/15 text-sky-800 border-sky-500/30'
                    : 'bg-[#132339] text-[#B8912E] border-[#B8912E]/30'
                }`}>
                  {user.role === 'SUPER_ADMIN' ? 'Direction Générale (Super Admin)' : user.role === 'ADMIN' ? 'Administrateur' : user.role === 'AGENT' ? 'Conseiller Immobilier' : 'Membre Club Villa Regia'}
                </span>
              </div>
              <p className="text-xs text-[#2c3f57] font-mono flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#B8912E]" /> {user.email}</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-800 px-2 py-0.2 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Compte Vérifié
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#2c3f57] hover:text-[#132339] p-1 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Staff Access Banner (If Admin / Staff) */}
        {isStaff && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#132339] to-[#1c3250] text-[#FAF8F3] border border-[#B8912E]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#B8912E] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#B8912E]" />
                <span>Portail de Gestion & Direction</span>
              </div>
              <p className="text-xs text-[#FAF8F3]/80 font-light">
                Vous disposez des privilèges administrateur complets pour piloter le catalogue, le CRM et les réservations.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                window.location.href = '/admin';
              }}
              className="px-4 py-2.5 rounded-xl bg-[#B8912E] hover:bg-amber-500 text-[#132339] font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 shadow-md"
            >
              <span>Accéder à l'Espace Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation Header */}
        <div className="flex border-b border-[rgba(19,35,57,0.12)] gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x -mx-2 px-2 sm:mx-0 sm:px-0">
          {[
            { id: 'profile', label: 'Mon Profil', icon: User },
            { id: 'bookings', label: `Mes Séjours (${userBookings.length})`, icon: Calendar },
            { id: 'submissions', label: `Mes Biens (${userSubmissions.length})`, icon: Building2 },
            { id: 'favorites', label: `Mes Favoris (${favorites.length})`, icon: Heart },
            { id: 'security', label: 'Sécurité', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap snap-start shrink-0 ${
                  isActive
                    ? 'bg-[#132339] text-[#FAF8F3] shadow-md font-bold'
                    : 'text-[#2c3f57] hover:bg-[#132339]/5 hover:text-[#132339]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: PROFILE EDIT & VIP MEMBERSHIP CARD ── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* VIP Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#132339] via-[#1c3250] to-[#132339] border border-[#B8912E]/40 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#B8912E]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B8912E] block font-bold">
                    Cercle Privilège Villa Regia
                  </span>
                  <h3 className="font-editorial text-xl font-light text-[#FAF8F3] mt-0.5">
                    Membre Résident & Propriétaire
                  </h3>
                </div>
                <div className="relative w-20 h-6">
                  <Image src="/images/logo-light.png" alt="Villa Regia" fill className="object-contain" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono border-t border-white/10 pt-4">
                <div>
                  <span className="text-white/50 block text-[10px]">Titulaire</span>
                  <span className="text-white font-bold truncate block">{user.name}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px]">Identifiant Client</span>
                  <span className="text-[#B8912E] font-bold font-mono">VR-{user.id.slice(-6).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px]">Conciergerie Dédiée</span>
                  <a href="https://wa.me/21627745403" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                    <MessageCircle className="w-3 h-3" /> +216 27 745 403
                  </a>
                </div>
              </div>
            </div>

            {/* Editable Info Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#132339]">
                Coordonnées Personnelles
              </h4>

              {profileError && (
                <div className="p-3 rounded-lg bg-red-500/10 text-red-700 text-xs border border-red-500/25 font-mono">
                  {profileError}
                </div>
              )}

              {isSaved && (
                <div className="p-3 rounded-lg bg-emerald-500/15 text-emerald-800 text-xs border border-emerald-500/30 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Vos informations personnelles ont été mises à jour avec succès.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#132339] font-semibold mb-1">Nom Complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#132339] font-semibold mb-1">Téléphone de Contact</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+216 27 745 403"
                    className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#132339] font-semibold mb-1">Adresse Email (Identifiant de Sécurité)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-[#EFE8D8] border border-[#132339]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#132339]/70 cursor-not-allowed font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-[#132339] hover:bg-[#1c3250] text-[#FAF8F3] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-md"
                >
                  {profileLoading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 2: MES RÉSERVATIONS & SÉJOURS (REAL DATA FROM DB) ── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#132339]">
                  Mes Réservations de Séjours & Villas
                </h3>
                <span className="text-[11px] text-[#2c3f57]">Données synchronisées en temps réel avec le planning des concierges.</span>
              </div>
              <Link
                href="/villas-de-luxe"
                onClick={onClose}
                className="text-xs text-[#132339] hover:text-[#B8912E] font-mono font-bold flex items-center gap-1"
              >
                <span>Nouvelle réservation</span>
                <ArrowRight className="w-3 h-3 text-[#B8912E]" />
              </Link>
            </div>

            {isLoadingRealData ? (
              <div className="py-12 text-center text-xs font-mono text-[#2c3f57] space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#132339]" />
                <p>Chargement de vos réservations...</p>
              </div>
            ) : userBookings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[rgba(19,35,57,0.12)] shadow-sm text-center space-y-3">
                <Calendar className="w-10 h-10 text-[#132339]/30 mx-auto" />
                <p className="text-sm text-[#132339] font-editorial font-medium">Vous n'avez aucune réservation de séjour pour le moment.</p>
                <p className="text-xs text-[#2c3f57]">Découvrez nos villas d'exception avec conciergerie privée à Sfax et réservez votre séjour.</p>
                <Link
                  href="/villas-de-luxe"
                  onClick={onClose}
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#132339] text-[#FAF8F3] text-xs font-bold uppercase tracking-widest hover:bg-[#1c3250] transition-all mt-2 shadow-md"
                >
                  Explorer les Demeures de Prestige
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-white border border-[rgba(19,35,57,0.12)] space-y-3 hover:border-[#B8912E]/50 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#132339] font-bold text-sm">{b.propertyTitle || 'Villa de Luxe Villa Regia'}</span>
                          <span className="text-[10px] font-mono text-[#2c3f57]">#{b.id}</span>
                        </div>
                        <span className="text-xs text-[#2c3f57] font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#B8912E]" /> Du {b.checkIn} au {b.checkOut} ({b.totalNights || 1} nuit{b.totalNights > 1 ? 's' : ''})
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                          : b.status === 'CANCELLED'
                          ? 'bg-red-500/15 text-red-800 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                      }`}>
                        {b.status === 'CONFIRMED' ? 'Confirmé' : b.status === 'CANCELLED' ? 'Annulé' : 'En Attente de Validation'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-[rgba(19,35,57,0.08)] text-xs font-mono">
                      <span className="text-[#2c3f57]">{b.guestsCount || b.guests || 2} Voyageur{(b.guestsCount || b.guests) > 1 ? 's' : ''}</span>
                      <span className="text-[#132339] font-bold">{(b.totalAmount || b.price || 0).toLocaleString()} TND</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: MES BIENS PROPOSÉS & DOSSIERS (REAL DATA FROM DB) ── */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#132339]">
                  Mes Dossiers Propriétaire Déposés
                </h3>
                <span className="text-[11px] text-[#2c3f57]">Suivez l'avancement juridique et commercial de vos biens soumis.</span>
              </div>
              <Link
                href="/proposer-un-bien"
                onClick={onClose}
                className="text-xs text-[#132339] hover:text-[#B8912E] font-mono font-bold flex items-center gap-1"
              >
                <span>Nouveau bien</span>
                <ArrowRight className="w-3 h-3 text-[#B8912E]" />
              </Link>
            </div>

            {isLoadingRealData ? (
              <div className="py-12 text-center text-xs font-mono text-[#2c3f57] space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#132339]" />
                <p>Chargement de vos dossiers...</p>
              </div>
            ) : userSubmissions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[rgba(19,35,57,0.12)] shadow-sm text-center space-y-3">
                <Building2 className="w-10 h-10 text-[#132339]/30 mx-auto" />
                <p className="text-sm text-[#132339] font-editorial font-medium">Aucun dossier propriétaire soumis avec cette adresse email.</p>
                <p className="text-xs text-[#2c3f57]">Vous possédez une villa, un domaine ou un duplex d'exception à Sfax ou Tunis ? Confiez-nous sa valorisation.</p>
                <Link
                  href="/proposer-un-bien"
                  onClick={onClose}
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#132339] text-[#FAF8F3] text-xs font-bold uppercase tracking-widest hover:bg-[#1c3250] transition-all mt-2 shadow-md"
                >
                  Proposer un Bien à la Vente ou Location
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userSubmissions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-white border border-[rgba(19,35,57,0.12)] space-y-3 hover:border-[#B8912E]/50 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#132339] font-bold text-sm">{s.propertyType} — {s.district || s.city || 'Sfax'}</span>
                          <span className="text-[10px] font-mono text-[#2c3f57]">Dossier #{s.refCode || s.id}</span>
                        </div>
                        <span className="text-xs text-[#2c3f57] font-mono block mt-0.5">
                          Objectif: {s.objective} • Surface: {s.surfaceM2 || 'Non précisée'} m² • Titre: {s.titleType || 'En vérification'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        s.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                          : s.status === 'REJECTED'
                          ? 'bg-red-500/15 text-red-800 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                      }`}>
                        {s.status === 'APPROVED' ? 'Validé & Publié' : s.status === 'REJECTED' ? 'Dossier Refusé' : 'En Évaluation Juridique'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-[rgba(19,35,57,0.08)] text-xs font-mono">
                      <span className="text-[#2c3f57]">Prix estimé: {(s.estimatedPrice || s.estimatedValue || 0).toLocaleString()} TND</span>
                      <a
                        href="https://wa.me/21627745403"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px] font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Contacter le conseiller</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: SAVED FAVORITES (FULL RICH PROPERTY CARDS) ── */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#132339]">
                Mes Demeures Enregistrées ({favorites.length})
              </h3>
              <Link
                href="/properties"
                onClick={onClose}
                className="text-xs text-[#132339] hover:text-[#B8912E] font-mono font-bold flex items-center gap-1"
              >
                <span>Catalogue complet</span>
                <ArrowRight className="w-3 h-3 text-[#B8912E]" />
              </Link>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-white rounded-2xl border border-[rgba(19,35,57,0.12)] shadow-sm">
                <Heart className="w-10 h-10 text-[#132339]/30 mx-auto" />
                <p className="text-sm text-[#132339] font-editorial font-medium">Aucun bien immobilier enregistré dans vos favoris.</p>
                <p className="text-xs text-[#2c3f57]">Cliquez sur le cœur d'une propriété pour la retrouver ici en un clin d'œil.</p>
                <Link
                  href="/properties"
                  onClick={onClose}
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#132339] text-[#FAF8F3] text-xs font-bold uppercase tracking-widest hover:bg-[#1c3250] transition-all mt-2 shadow-md"
                >
                  Découvrir le Catalogue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
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
                      className="p-3.5 rounded-xl bg-white border border-[rgba(19,35,57,0.12)] hover:border-[#B8912E]/50 transition-all flex flex-col justify-between gap-3 group shadow-sm"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[rgba(19,35,57,0.1)]">
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
                            <span className="text-xs font-bold text-[#132339] font-mono block">
                              {property.price.amount.toLocaleString()} {property.price.currency}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[rgba(19,35,57,0.08)] text-xs">
                        <Link
                          href={`/properties/${favId}`}
                          onClick={onClose}
                          className="text-[#132339] hover:text-[#B8912E] font-mono font-bold flex items-center gap-1 text-[11px]"
                        >
                          <span>Voir la fiche</span>
                          <ExternalLink className="w-3 h-3 text-[#B8912E]" />
                        </Link>
                        <button
                          onClick={() => toggleFavorite(favId)}
                          className="text-[#2c3f57] hover:text-red-600 p-1 transition-colors flex items-center gap-1 text-[11px]"
                          title="Retirer des favoris"
                        >
                          <X className="w-3.5 h-3.5" />
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

        {/* ── TAB 5: SECURITY & PASSWORD CHANGE ── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#132339]">
                Modifier mon Mot de Passe
              </h4>

              {passError && (
                <div className="p-3 rounded-lg bg-red-500/10 text-red-700 text-xs border border-red-500/25 font-mono">
                  {passError}
                </div>
              )}

              {passSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/15 text-emerald-800 text-xs border border-emerald-500/30 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-[#132339] font-semibold mb-1">Mot de Passe Actuel</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] pr-10 shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#132339]/40 hover:text-[#132339]"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#132339] font-semibold mb-1">Nouveau Mot de Passe (min. 6 caractères)</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] pr-10 shadow-sm"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#132339]/40 hover:text-[#132339]"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#132339] font-semibold mb-1">Confirmer le Nouveau Mot de Passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] shadow-sm"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="bg-[#132339] hover:bg-[#1c3250] text-[#FAF8F3] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-md"
                >
                  {passLoading ? 'Mise à jour...' : 'Mettre à Jour le Mot de Passe'}
                </button>
              </div>
            </form>

            {/* Audit Logs */}
            {auditLogs.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-[rgba(19,35,57,0.12)]">
                <span className="text-[10px] font-mono uppercase text-[#132339] font-bold block">Dernières Activités de Sécurité</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="p-2 rounded-lg bg-white border border-[rgba(19,35,57,0.12)] flex items-center justify-between text-[11px] font-mono shadow-sm">
                      <div>
                        <span className="text-[#132339] font-bold">{log.action}</span>
                        <span className="text-[#2c3f57] block text-[10px]">{log.target}</span>
                      </div>
                      <span className="text-[#2c3f57]/60 text-[10px]">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer with Logout and Branding */}
        <div className="pt-4 border-t border-[rgba(19,35,57,0.12)] flex justify-between items-center">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 font-bold uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Se Déconnecter</span>
          </button>
          <span className="text-[10px] text-[#2c3f57] font-mono font-medium">Villa Regia Real Estates • Sfax</span>
        </div>
      </motion.div>
    </div>
  );
};
