'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Phone, Mail, ArrowUpRight, Instagram, Facebook, Linkedin, MessageCircle } from 'lucide-react';

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
                <a href="tel:+21627745403" className="hover:text-brand-gold font-mono">+216 27 745 403</a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a href="https://wa.me/21627745403" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 font-mono flex items-center gap-1.5">
                  <span>WhatsApp Business: 27 745 403</span>
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <a href="mailto:villaregia.contact@gmail.com" className="hover:text-brand-gold">villaregia.contact@gmail.com</a>
              </div>
            </div>

            {/* Tunisian Law Badge */}
            <div className="pt-1">
              <span className="text-[10px] font-mono text-brand-gold/90 bg-brand-gold/10 border border-brand-gold/25 px-2.5 py-1 rounded inline-block">
                ⚖️ Régie par la Loi Tunisienne (Code des Droits Réels)
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://www.instagram.com/villaregia_/?hl=fr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/5 text-brand-gold hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 hover:text-white transition-all border border-white/10 hover:border-transparent group"
                title="Suivez Villa Regia sur Instagram (@villaregia_)"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61572363513663"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/5 text-brand-gold hover:bg-[#1877F2] hover:text-white transition-all border border-white/10 hover:border-transparent group"
                title="Suivez Villa Regia sur Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@villaregia.tn"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/5 text-brand-gold hover:bg-black hover:text-white transition-all border border-white/10 hover:border-transparent group"
                title="Suivez Villa Regia sur TikTok (@villaregia.tn)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/21627745403"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/5 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all border border-white/10 hover:border-transparent group"
                title="WhatsApp Business Villa Regia (+216 27 745 403)"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-travertine/60">
          <p>© {new Date().getFullYear()} Villa Regia Real Estates Sfax. {t('footer.rights')}</p>
          
          {/* Powered by EASYWEB */}
          <div className="text-center font-mono text-[11px]">
            <a
              href="https://easyweb-growthagency.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:text-white font-bold tracking-wider underline underline-offset-4 decoration-brand-gold/60 hover:decoration-white transition-all"
            >
              Powered By EASYWEB
            </a>
          </div>

          <div className="flex items-center space-x-6 rtl:space-x-reverse text-[11px]">
            <a href="#" className="hover:text-brand-gold">Mentions Légales (Loi TN)</a>
            <a href="#" className="hover:text-brand-gold">Politique de Confidentialité</a>
            <a href="#" className="hover:text-brand-gold">Conservation Foncière (CPF)</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
