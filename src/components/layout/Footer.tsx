'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Phone, Mail, ArrowUpRight, Instagram, Facebook, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-navy-dark text-brand-travertine border-t border-brand-gold/15 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative w-44 h-12">
              <Image
                src="/images/logo-light.png"
                alt="Villa Regia Real Estates Sfax"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-brand-travertine/70 leading-relaxed font-light max-w-md">
              {t('footer.positioning')}
            </p>
            <div className="p-4 rounded border border-brand-gold/20 bg-brand-navy/60 inline-block">
              <p className="text-xs text-brand-gold font-mono tracking-widest uppercase mb-1">
                Philosophie
              </p>
              <p className="text-xs italic text-brand-travertine/80">
                « Nous sélectionnons des lieux qui ont une histoire, un caractère et une valeur. »
              </p>
            </div>
          </div>

          {/* Universes */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gold">
              Les Quatre Univers
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-travertine/80">
              <li>
                <Link href="/properties?universe=VENTE" className="hover:text-brand-gold transition-colors">
                  Vente Patrimoniale
                </Link>
              </li>
              <li>
                <Link href="/properties?universe=RESIDENCE" className="hover:text-brand-gold transition-colors">
                  Résidences d’Exception
                </Link>
              </li>
              <li>
                <Link href="/villas-de-luxe" className="hover:text-brand-gold transition-colors">
                  Villas de Luxe (Court Séjour)
                </Link>
              </li>
              <li>
                <Link href="/evenementiel" className="hover:text-brand-gold transition-colors">
                  Espaces Événementiels
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gold">
              Maison & Services
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-travertine/80">
              <li>
                <Link href="/proposer-un-bien" className="hover:text-brand-gold transition-colors">
                  Proposer un bien
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-brand-gold transition-colors">
                  Le Regard Villa Regia (Journal)
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-brand-gold transition-colors">
                  Notre Histoire & Vision
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-gold transition-colors">
                  Nous Contacter
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-gold transition-colors opacity-60">
                  Espace Gestionnaire / Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Sfax Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gold">
              Siège Sfax
            </h4>
            <div className="space-y-3 text-xs text-brand-travertine/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>Route de la Soukra, Km 2.5<br />3000 Sfax, Tunisie</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <a href="tel:+21674000111" className="hover:text-brand-gold">+216 74 000 111</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <a href="mailto:contact@villaregia.tn" className="hover:text-brand-gold">contact@villaregia.tn</a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded bg-white/5 text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded bg-white/5 text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded bg-white/5 text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-travertine/50">
          <p>© {new Date().getFullYear()} Villa Regia Real Estates Sfax. {t('footer.rights')}</p>
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <a href="#" className="hover:text-brand-gold">Mentions Légales</a>
            <a href="#" className="hover:text-brand-gold">Politique de Confidentialité</a>
            <a href="#" className="hover:text-brand-gold">Gestion des Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
