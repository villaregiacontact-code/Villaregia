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
import { Heart, Globe, Menu, X, PlusCircle, ChevronDown, UserCheck, LogIn, User, Instagram, Facebook, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { favorites } = useFavorites();
  const { user } = useAuth();
  
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 glass-navy shadow-2xl border-b border-brand-gold/15'
            : 'py-6 bg-gradient-to-b from-brand-navy/90 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Emblem / Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-36 sm:w-44 h-11 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo-light.png"
                  alt="Villa Regia Real Estates Sfax"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
              {navLinks.slice(1, 6).map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs uppercase tracking-widest transition-colors duration-300 py-1 border-b ${
                      isActive
                        ? 'text-brand-gold border-brand-gold font-medium'
                        : 'text-brand-travertine/80 border-transparent hover:text-brand-gold hover:border-brand-gold/40'
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
                className="relative p-2 text-brand-travertine/80 hover:text-brand-gold transition-colors"
                title={t('btn.favorites')}
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-navy text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Language Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1.5 text-xs tracking-wider uppercase text-brand-travertine/80 hover:text-brand-gold px-2.5 py-1.5 rounded border border-white/10 hover:border-brand-gold/40 transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{language.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-28 glass-navy rounded shadow-xl border border-brand-gold/20 py-1 overflow-hidden"
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
                              ? 'bg-brand-gold/20 text-brand-gold font-bold'
                              : 'text-brand-travertine/80 hover:bg-white/5 hover:text-white'
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
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-brand-gold/30 hover:border-brand-gold text-xs text-brand-travertine transition-all glass-card hover:bg-white/5"
              >
                {user ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-[11px] text-brand-gold uppercase font-bold">{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-white/50 font-mono">({user.role})</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-brand-gold" />
                    <span className="uppercase text-[11px]">Connexion / Inscription</span>
                  </>
                )}
              </button>

              {/* If staff user is logged in, show direct Admin link */}
              {user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER'].includes(user.role) && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-gold text-brand-navy hover:opacity-95 transition-all text-xs font-mono font-bold shadow-md"
                  title="Accéder au Tableau de Bord Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Submit Property CTA */}
              <Link
                href="/proposer-un-bien"
                className="flex items-center gap-2 bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-brand-gold/10"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('nav.submit_property')}</span>
              </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="p-1.5 text-brand-gold"
              >
                <LogIn className="w-5 h-5" />
              </button>
              
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
              <div className="px-6 py-8 space-y-4">
                <nav className="flex flex-col space-y-3">
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

                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
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
                      href="https://wa.me/21627745405"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/5 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all border border-white/10"
                      title="WhatsApp Business (+216 27 745 405)"
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
