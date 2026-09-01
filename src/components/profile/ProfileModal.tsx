'use client';

import React, { useState } from 'react';
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
  SlidersHorizontal,
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

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'favorites' | 'history'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currency, setCurrency] = useState('TND');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    user.name = name;
    user.phone = phone;
    localStorage.setItem('vr_user', JSON.stringify(user));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-navy p-6 sm:p-8 rounded-2xl max-w-2xl w-full border border-brand-gold/30 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-brand-travertine/60 hover:text-brand-gold transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Header Badge */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-gold/30 to-brand-gold text-brand-navy flex items-center justify-center font-bold text-xl border border-brand-gold/50 shadow-lg shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-editorial text-2xl font-light text-brand-travertine">
                {user.name}
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-brand-travertine/60 font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-gold" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation Header */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
          {[
            { id: 'profile', label: 'Mon Profil', icon: User },
            { id: 'security', label: 'Sécurité & 2FA', icon: ShieldCheck },
            { id: 'favorites', label: `Mes Favoris (${favorites.length})`, icon: Heart },
            { id: 'history', label: 'Historique', icon: Calendar },
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

        {/* Tab 1: Profile Edit */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {isSaved && (
              <div className="p-3 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profil mis à jour avec succès !</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Nom & Prénom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Téléphone Direct</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                  placeholder="+216 -- --- ---"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Langue Préférée</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white font-mono"
                >
                  <option value="fr">Français (FR)</option>
                  <option value="ar">العربية (AR)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Devise d'Affichage</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white font-mono"
                >
                  <option value="TND">TND (Dinar Tunisien)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="USD">USD ($ Dollar US)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3 rounded shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sauvegarder mon Profil</span>
            </button>
          </form>
        )}

        {/* Tab 2: Security & 2FA */}
        {activeTab === 'security' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Authentification Forte 2FA Email</h4>
                    <p className="text-xs text-brand-travertine/60 font-mono">Code à 6 chiffres transmis par email lors de chaque connexion staff</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {is2FAVerified ? 'ACTIF & VÉRIFIÉ' : 'REQUIS'}
                </span>
              </div>
            </div>

            {['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role) && (
              <button
                onClick={() => {
                  router.push('/admin');
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded shadow-xl flex items-center justify-center gap-2"
              >
                <span>Accéder au Tableau de Bord Admin (Espace Staff)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Recent Security Logs */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-brand-gold block font-bold">Dernières Activités Sécurisées</span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {auditLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="p-2.5 rounded bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
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

        {/* Tab 3: Saved Favorites */}
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
                  const property = INITIAL_PROPERTIES.find((p) => p.id === favId);
                  return (
                    <div key={favId} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                      <div className="space-y-0.5 truncate">
                        <span className="text-xs font-bold text-brand-gold truncate block">
                          {property ? property.title : `Bien ${favId}`}
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

        {/* Tab 4: History & Inquiries */}
        {activeTab === 'history' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-brand-gold font-bold block">Réservation Stay Luxe #VR-8821</span>
                <span className="text-white/50 text-[10px]">Villa Palais des Oliviers • Sfax Soukra</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">CONFIRMÉ</span>
            </div>

            <div className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center">
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
