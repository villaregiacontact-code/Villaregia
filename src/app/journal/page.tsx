'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_ARTICLES } from '@/data/properties';
import { BookOpen, ArrowUpRight, Sparkles } from 'lucide-react';

export default function JournalPage() {
  const { language } = useLanguage();

  return (
    <div className="pt-28 pb-24 bg-brand-navy min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-brand-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Magazine & Réflexions</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-brand-travertine">
            Le Regard Villa Regia
          </h1>
          <p className="text-sm text-brand-travertine/80 font-light leading-relaxed">
            Analyses d’architecture, perspectives d’investissement immobilier à Sfax et art de vivre en Méditerranée.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {INITIAL_ARTICLES.map((article) => (
            <Link
              key={article.id}
              href={`/journal/${article.slug}`}
              className="group glass-card rounded-xl overflow-hidden border border-brand-gold/20 hover:border-brand-gold/50 transition-all flex flex-col justify-between"
            >
              <div className="relative w-full h-72 overflow-hidden">
                <Image
                  src={article.coverImage}
                  alt={article.title[language]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-brand-navy/80 backdrop-blur text-brand-gold text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded border border-brand-gold/30">
                  {article.category}
                </div>
              </div>

              <div className="p-8 space-y-3">
                <div className="flex justify-between items-center text-[11px] text-brand-travertine/50 font-mono">
                  <span>{article.author}</span>
                  <span>{article.readTime}</span>
                </div>

                <h2 className="font-editorial text-2xl text-brand-travertine group-hover:text-brand-gold transition-colors font-light">
                  {article.title[language]}
                </h2>

                <p className="text-xs text-brand-travertine/70 font-light leading-relaxed">
                  {article.excerpt[language]}
                </p>

                <div className="pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold">
                  <span>Lire l’analyse complète</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
