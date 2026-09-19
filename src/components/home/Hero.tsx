'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Home, Crown, Calendar, Compass } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  const quickPills = [
    { label: t('nav.sale'), href: '/properties?universe=VENTE', color: 'border-[#B15A3C]/40 text-[#B15A3C] bg-[#B15A3C]/8 hover:bg-[#B15A3C] hover:text-white', icon: Home },
    { label: t('nav.luxe'), href: '/villas-de-luxe', color: 'border-[#B8912E]/40 text-[#B8912E] bg-[#B8912E]/8 hover:bg-[#B8912E] hover:text-white', icon: Crown },
    { label: t('nav.event'), href: '/evenementiel', color: 'border-[#6E7A52]/40 text-[#6E7A52] bg-[#6E7A52]/8 hover:bg-[#6E7A52] hover:text-white', icon: Calendar },
    { label: t('footer.land'), href: '/properties?category=Terrain', color: 'border-[#1A1615]/30 text-[#1A1615] bg-[#1A1615]/8 hover:bg-[#1A1615] hover:text-white', icon: Compass },
  ];

  return (
    <section className="pt-32 pb-20 px-4 sm:px-8 max-w-[1180px] mx-auto min-h-[88vh] flex items-center overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 sm:gap-16 items-center w-full">
        
        {/* Left Column Content */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B15A3C]/10 border border-[#B15A3C]/25 text-[#B15A3C] text-xs font-semibold uppercase tracking-wider mb-5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('hero.badge_sfax')}</span>
          </motion.div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[60px] text-[#1A1615] font-semibold leading-[1.04] tracking-tight max-w-[14ch]">
            {t('hero.title')}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#443E3B] max-w-[44ch] leading-relaxed font-normal">
            {t('hero.description')}
          </p>

          {/* Color-Synced Universe Filter Pills */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            {quickPills.map((pill) => {
              const Icon = pill.icon;
              return (
                <Link
                  key={pill.label}
                  href={pill.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide transition-all duration-300 ${pill.color} shadow-2xs hover:scale-105`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pill.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href="/properties?universe=VENTE"
              className="inline-flex items-center gap-2.5 bg-[#B15A3C] text-[#FAF8F3] hover:bg-[#97492e] px-8 py-4 text-sm sm:text-base font-medium rounded-xs transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 group"
            >
              <span>{t('hero.btn_sale')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              href="/villas-de-luxe"
              className="inline-flex items-center justify-center border border-[#1A1615] text-[#1A1615] hover:bg-[#1A1615] hover:text-[#FAF8F3] px-8 py-4 text-sm sm:text-base font-medium rounded-xs transition-all duration-300 hover:-translate-y-0.5"
            >
              {t('hero.btn_book')}
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-8 sm:gap-12 mt-12 pt-6 border-t border-[rgba(26,22,21,0.14)]">
            <div className="stat">
              <b className="block font-serif text-2xl sm:text-3xl font-semibold text-[#1A1615]">240+</b>
              <span className="text-xs sm:text-sm text-[#443E3B]">{t('hero.stat1_label')}</span>
            </div>
            <div className="stat">
              <b className="block font-serif text-2xl sm:text-3xl font-semibold text-[#1A1615]">18</b>
              <span className="text-xs sm:text-sm text-[#443E3B]">{t('hero.stat2_label')}</span>
            </div>
            <div className="stat">
              <b className="block font-serif text-2xl sm:text-3xl font-semibold text-[#1A1615]">4</b>
              <span className="text-xs sm:text-sm text-[#443E3B]">{t('hero.stat3_label')}</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column Luxury Arch Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[440px] sm:h-[520px] w-full flex items-center justify-center group"
        >
          {/* Main Arch Frame Container */}
          <div className="relative w-full h-full rounded-[400px_400px_16px_16px] overflow-hidden shadow-2xl border-2 border-[#B8912E]/40 p-2 bg-[#EFE8D8]">
            <div className="relative w-full h-full rounded-[392px_392px_12px_12px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=90"
                alt="Villa Regia Demeure d'Exception Sfax"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1615]/65 via-transparent to-black/10" />
            </div>

            {/* Floating Luxury Glass Badge with Gentle Motion */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-6 left-6 right-6 p-4 rounded-xs bg-[#FAF8F3]/95 backdrop-blur-md border border-[rgba(26,22,21,0.14)] shadow-xl flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B8912E] block">
                  Demeure d'Exception
                </span>
                <span className="font-serif text-base font-semibold text-[#1A1615]">
                  Villa Les Oliviers — Route Manzel Chaker Km 1.5
                </span>
              </div>
              <span className="text-xs font-semibold text-[#B15A3C] bg-[#B15A3C]/10 px-2.5 py-1 rounded-xs border border-[#B15A3C]/20">
                Sfax
              </span>
            </motion.div>
          </div>

          {/* Decorative Outer Metallic Arch Ring */}
          <div className="absolute -inset-3 rounded-[412px_412px_20px_20px] border border-[#B8912E]/25 pointer-events-none -z-10 hidden sm:block" />
        </motion.div>

      </div>
    </section>
  );
};



