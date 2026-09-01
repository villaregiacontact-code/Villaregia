'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown, Sparkles, Compass } from 'lucide-react';

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-brand-navy">
      
      {/* Background Architectural Image with Slow Zoom */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.55 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=90"
            alt="Villa Regia Mediterranean Architecture Sfax"
            fill
            priority
            className="object-cover object-center"
          />
        </motion.div>
        {/* Gradients to blend seamless dark luxury */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-brand-navy/30" />
        <div className="absolute inset-0 bg-radial-glow opacity-60" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        
        {/* Location Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-navy border border-brand-gold/30 text-brand-gold text-[11px] font-mono tracking-[0.25em] uppercase mb-6"
        >
          <Sparkles className="w-3 h-3 text-brand-gold animate-pulse" />
          <span>{t('hero.badge')}</span>
        </motion.div>

        {/* Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-light text-brand-travertine tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto"
        >
          Des lieux qui méritent d’être <span className="text-gold-gradient font-normal italic">vécus.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-base sm:text-xl text-brand-travertine/80 font-light max-w-2xl mx-auto leading-relaxed mb-10"
        >
          {t('hero.subhead')}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="#universes"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold-dark text-brand-navy px-8 py-4 rounded text-xs font-bold uppercase tracking-widest hover:opacity-95 transition-all shadow-xl shadow-brand-gold/20 group"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
            <span>{t('hero.cta_explore')}</span>
          </Link>

          <Link
            href="/proposer-un-bien"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass-navy hover:bg-white/10 text-brand-travertine border border-brand-gold/30 hover:border-brand-gold px-8 py-4 rounded text-xs font-semibold uppercase tracking-widest transition-all"
          >
            <span>{t('hero.cta_propose')}</span>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.a
        href="#universes"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-travertine/60 hover:text-brand-gold transition-colors z-10"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase">Découvrir</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-brand-gold" />
      </motion.a>
    </section>
  );
};
