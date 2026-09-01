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
import { Heart, Globe, Menu, X, PlusCircle, ChevronDown, UserCheck, LogIn, User } from 'lucide-react';
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
                onClick={() => (user ? setProfileModalOpen(true) : setAuthModalOpen(true))}
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
                    className="w-full text-center bg-brand-gold text-brand-navy py-3 rounded text-xs font-bold uppercase tracking-wider mt-2"
                  >
                    {t('nav.submit_property')}
                  </Link>
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
