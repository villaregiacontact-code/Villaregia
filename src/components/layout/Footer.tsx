'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[rgba(26,22,21,0.14)] bg-[#FAF8F3] pt-14 pb-10 text-[#1A1615]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        
        {/* Foot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-11">
          <div>
            <div className="relative w-44 h-11 mb-3">
              <Image
                src="/images/logo-dark.png"
                alt="Villa Regia Real Estates Sfax"
                fill
                className="object-contain object-left rounded-xs"
              />
            </div>
            <p className="text-sm text-[#443E3B] mb-2">
              {t('footer.tagline')}
            </p>
            <p className="text-sm text-[#443E3B]">
              {t('footer.location')}
            </p>
          </div>

          <div>
            <h5 className="font-sans text-sm font-semibold mb-4 text-[#1A1615]">
              {t('footer.sale')}
            </h5>
            <div className="flex flex-col space-y-2 text-sm text-[#443E3B]">
              <Link href="/properties?universe=VENTE" className="hover:text-[#B15A3C] transition-colors">{t('footer.villas')}</Link>
              <Link href="/properties?universe=VENTE" className="hover:text-[#B15A3C] transition-colors">{t('footer.land')}</Link>
              <Link href="/properties?universe=VENTE" className="hover:text-[#B15A3C] transition-colors">{t('footer.farmland')}</Link>
              <Link href="/properties?universe=VENTE" className="hover:text-[#B15A3C] transition-colors">{t('footer.apartments')}</Link>
            </div>
          </div>

          <div>
            <h5 className="font-sans text-sm font-semibold mb-4 text-[#1A1615]">
              {t('footer.rent')}
            </h5>
            <div className="flex flex-col space-y-2 text-sm text-[#443E3B]">
              <Link href="/properties?universe=RESIDENCE" className="hover:text-[#B15A3C] transition-colors">{t('footer.residence_long')}</Link>
              <Link href="/villas-de-luxe" className="hover:text-[#B15A3C] transition-colors">{t('footer.luxe_villas')}</Link>
              <Link href="/evenementiel" className="hover:text-[#B15A3C] transition-colors">{t('footer.event_spaces')}</Link>
            </div>
          </div>

          <div>
            <h5 className="font-sans text-sm font-semibold mb-4 text-[#1A1615]">
              {t('footer.agency')}
            </h5>
            <div className="flex flex-col space-y-2 text-sm text-[#443E3B]">
              <Link href="/proposer-un-bien" className="hover:text-[#B15A3C] transition-colors font-semibold text-[#B15A3C]">{t('nav.submit_property')}</Link>
              <Link href="/a-propos" className="hover:text-[#B15A3C] transition-colors">{t('nav.about')}</Link>
              <Link href="/journal" className="hover:text-[#B15A3C] transition-colors">{t('footer.blog_advice')}</Link>
              <Link href="/contact" className="hover:text-[#B15A3C] transition-colors">{t('nav.contact')}</Link>
              <a href="tel:+21627745403" className="hover:text-[#B15A3C] transition-colors font-mono">+216 27 745 403</a>
            </div>
          </div>
        </div>

        {/* Foot Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-[rgba(26,22,21,0.14)] text-xs text-[#443E3B] gap-3">
          <span>© {new Date().getFullYear()} Villa Regia. {t('footer.rights')}</span>
          <div className="flex gap-4">
            <a href="https://easyweb-growthagency.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-mono">
              Powered By EASYWEB
            </a>
            <span>Français · العربية · English</span>
          </div>
        </div>

      </div>
    </footer>
  );
};


