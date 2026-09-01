'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Compass, PlusCircle } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-28 bg-gradient-to-b from-brand-navy to-brand-navy-dark border-t border-brand-gold/15 relative overflow-hidden text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        
        <span className="text-xs font-mono tracking-[0.3em] uppercase text-brand-gold">
          Prochaine Étape
        </span>

        <h2 className="font-editorial text-4xl sm:text-6xl text-brand-travertine font-light leading-tight">
          Votre prochaine adresse vous attend peut-être déjà.
        </h2>

        <p className="text-sm sm:text-base text-brand-travertine/80 max-w-2xl mx-auto font-light leading-relaxed">
          Que vous cherchiez à acquérir une villa d’exception à Sfax, louer une demeure de prestige ou proposer votre bien au catalogue Villa Regia, notre équipe vous accompagne avec discrétion.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold-dark text-brand-navy px-8 py-4 rounded text-xs font-bold uppercase tracking-widest hover:opacity-95 transition-all shadow-xl shadow-brand-gold/20"
          >
            <Compass className="w-4 h-4" />
            <span>EXPLORER LES PROPRIÉTÉS</span>
          </Link>

          <Link
            href="/proposer-un-bien"
            className="inline-flex items-center justify-center gap-2 glass-navy text-brand-travertine border border-brand-gold/30 hover:border-brand-gold px-8 py-4 rounded text-xs font-semibold uppercase tracking-widest transition-all"
          >
            <PlusCircle className="w-4 h-4 text-brand-gold" />
            <span>PROPOSER UN BIEN</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
