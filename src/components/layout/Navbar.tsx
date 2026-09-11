'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage, Language } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { Heart, Globe, Menu, X, PlusCircle, ChevronDown, UserCheck, LogIn, User, Instagram, Facebook, MessageCircle, ShieldCheck, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { favorites } = useFavorites();
  const { user, logout } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/properties?universe=VENTE', label: t('nav.sale') },
    { href: '/properties?universe=RESIDENCE', label: t('nav.residence') },
    { href: '/villas-de-luxe', label: t('nav.luxe') },
    { href: '/evenementiel', label: t('nav.event') },
    { href: '/journal', label: t('nav.journal') },
    { href: '/a-propos', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-[#FAF8F3]/95 backdrop-blur-md shadow-sm border-b border-[rgba(19,35,57,0.14)]'
            : 'py-4 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[rgba(19,35,57,0.14)]'
        }`}
      >
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Emblem / Logo */}
            <Link href="/" className="flex items-baseline gap-2 group">
              <span className="font-serif text-2xl font-semibold text-[#132339] tracking-tight">Villa Regia</span>
              <span className="text-xs text-[#2c3f57] tracking-wider hidden sm:inline">— Sfax, Tunisie</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse text-[14.5px]">
              {navLinks.slice(1, 7).map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`py-1 border-b-2 transition-colors duration-200 ${
                      isActive
                        ? 'text-[#132339] border-[#B15A3C] font-medium'
                        : 'text-[#132339] border-transparent hover:border-[#B15A3C]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
              {/* Favorites Counter */}
              <Link
                href="/properties?saved=true"
                className="relative p-2 text-[#2c3f57] hover:text-[#B15A3C] transition-colors"
                title={t('btn.favorites')}
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B15A3C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Language Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1 text-xs tracking-wider uppercase text-[#2c3f57] hover:text-[#132339] px-2.5 py-1.5 rounded border border-[rgba(19,35,57,0.14)] transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-[#B8912E]" />
                  <span className="font-semibold">{language.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-28 bg-[#FAF8F3] rounded shadow-xl border border-[rgba(19,35,57,0.14)] py-1 overflow-hidden z-50"
                    >
                      {(['fr', 'ar', 'en'] as Language[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setLanguage(lang);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs tracking-wider uppercase transition-colors ${
                            language === lang
                              ? 'bg-[#EFE8D8] text-[#132339] font-bold'
                              : 'text-[#2c3f57] hover:bg-[#EFE8D8]/50 hover:text-[#132339]'
                          }`}
                        >
                          {lang === 'fr' ? 'Français' : lang === 'ar' ? 'العربية' : 'English'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth User Login / Profile Trigger */}
              <button
                onClick={() => {
                  if (user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role)) {
                    window.location.href = '/admin';
                  } else if (user) {
                    setProfileModalOpen(true);
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-[rgba(19,35,57,0.14)] hover:border-[#132339] text-xs text-[#132339] transition-all hover:bg-[#EFE8D8]/40"
              >
                {user ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono text-[11px] text-[#132339] uppercase font-bold">{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-[#2c3f57] font-mono">({user.role})</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#B15A3C]" />
                    <span className="uppercase text-[11px] font-medium">Connexion</span>
                  </>
                )}
              </button>

              {/* If staff user is logged in, show direct Admin link */}
              {user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role) && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#132339] text-[#FAF8F3] hover:bg-[#2c3f57] transition-all text-xs font-mono font-bold shadow"
                  title="Accéder au Tableau de Bord Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Submit Property CTA */}
              <Link
                href="/contact"
                className="flex items-center gap-2 bg-[#132339] text-[#FAF8F3] hover:bg-[#2c3f57] px-4 py-2 rounded-sm text-xs font-medium uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Nous contacter</span>
              </Link>
            </div>

            {/* Mobile Menu Trigger & User Icon */}
            <div className="flex items-center gap-2 lg:hidden">
              {user ? (
                <button
                  onClick={() => {
                    if (['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role)) {
                      window.location.href = '/admin';
                    } else {
                      window.location.href = '/account';
                    }
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-gold/30 bg-white/5 text-brand-gold text-xs font-mono font-bold"
                  title="Mon Compte"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] truncate max-w-[65px]">{user.name.split(' ')[0]}</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="p-1.5 text-brand-gold hover:text-amber-300"
                  title="Connexion"
                >
                  <LogIn className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-brand-travertine hover:text-brand-gold focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-navy border-b border-brand-gold/20 overflow-hidden"
            >
              <div className="px-5 py-6 space-y-4">
                {/* Mobile User VIP Account Section */}
                {user ? (
                  <div className="p-4 rounded-xl bg-white/5 border border-brand-gold/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-gold/30 to-brand-gold text-brand-navy flex items-center justify-center font-bold text-sm border border-brand-gold/40 shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{user.name}</div>
                          <div className="text-[10px] text-brand-travertine/60 font-mono truncate">{user.email}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase bg-brand-gold/15 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded shrink-0">
                        {user.role === 'SUPER_ADMIN' ? 'Direction' : user.role === 'ADMIN' ? 'Admin' : user.role === 'AGENT' ? 'Agent' : 'VIP'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-lg bg-brand-gold/15 text-brand-gold text-center font-bold border border-brand-gold/30 hover:bg-brand-gold hover:text-brand-navy transition-all"
                      >
                        Mon Compte
                      </Link>
                      {['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role) ? (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="p-2 rounded-lg bg-brand-gold text-brand-navy text-center font-bold shadow hover:opacity-95 transition-all"
                        >
                          Espace Admin
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setProfileModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-white/5 text-white/80 text-center hover:bg-white/10 transition-colors"
                        >
                          Fiche Profil
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono">
                      <Link
                        href="/properties?saved=true"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-brand-travertine/70 hover:text-brand-gold flex items-center gap-1"
                      >
                        <Heart className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Favoris ({favorites.length})</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-bold font-mono uppercase tracking-wider hover:bg-brand-gold hover:text-brand-navy transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Connexion / Espace Membre VIP</span>
                  </button>
                )}

                <nav className="flex flex-col space-y-3 pt-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm uppercase tracking-widest text-brand-travertine hover:text-brand-gold py-1.5 border-b border-white/5"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
                  <Link
                    href="/proposer-un-bien"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-brand-gold text-brand-navy py-3 rounded text-xs font-bold uppercase tracking-wider mt-2 shadow"
                  >
                    {t('nav.submit_property')}
                  </Link>

                  {/* Mobile Social Links */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <a
                      href="https://www.instagram.com/villaregia_/?hl=fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/5 text-brand-gold hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 hover:text-white transition-all border border-white/10"
                      title="Instagram @villaregia_"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61572363513663"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/5 text-brand-gold hover:bg-[#1877F2] hover:text-white transition-all border border-white/10"
                      title="Facebook Villa Regia"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a
                      href="https://www.tiktok.com/@villaregia.tn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/5 text-brand-gold hover:bg-black hover:text-white transition-all border border-white/10"
                      title="TikTok @villaregia.tn"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </a>
                    <a
                      href="https://wa.me/21627745403"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/5 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all border border-white/10"
                      title="WhatsApp Business (+216 27 745 403)"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Login & Security Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      
      {/* User Profile & Security Modal */}
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </>
  );
};
