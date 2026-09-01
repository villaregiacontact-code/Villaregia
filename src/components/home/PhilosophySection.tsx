'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Award, Eye, HeartHandshake } from 'lucide-react';

export const PhilosophySection: React.FC = () => {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: Eye,
      title: 'Sélection Exclusive',
      desc: 'Chaque bien fait l’objet d’une étude rigoureuse d’architecture, d’emplacement et de potentiel patrimonial.',
    },
    {
      icon: ShieldCheck,
      title: 'Confidentialité Absolue',
      desc: 'Nous garantissons un traitement discret et personnalisé pour les propriétaires et acquéreurs de prestige.',
    },
    {
      icon: Award,
      title: 'Ancrage Sfaxien & International',
      desc: 'Une connaissance intime du marché immobilier de Sfax couplée aux standards du luxe international.',
    },
    {
      icon: HeartHandshake,
      title: 'Accompagnement Sur Mesure',
      desc: 'De la première visite à la conciergerie privée, nous façonnons une expérience sans couture.',
    },
  ];

  return (
    <section className="py-28 bg-brand-navy-dark border-t border-brand-gold/15 relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Manifesto */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-brand-gold">
              Manifeste & Vision
            </span>

            <h2 className="font-editorial text-3xl sm:text-5xl font-light text-brand-travertine leading-tight">
              « Nous sélectionnons des lieux qui ont une histoire, un caractère et une valeur. »
            </h2>

            <p className="text-sm text-brand-travertine/80 font-light leading-relaxed">
              L’immobilier d’exception ne se résume pas à des mètres carrés. C’est la recherche d’une lumière particulière, d’une harmonie architecturale et d’une adresse qui traverse le temps. Villa Regia est le curateur d’espaces d’exception à Sfax.
            </p>

            <div className="pt-4">
              <Link
                href="/a-propos"
                className="inline-flex items-center gap-3 bg-white/5 hover:bg-brand-gold hover:text-brand-navy border border-brand-gold/30 text-brand-gold px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all"
              >
                <span>Découvrir notre philosophie</span>
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Pillars Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-lg glass-card border border-brand-gold/15 space-y-3 hover:border-brand-gold/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-editorial text-xl font-normal text-brand-travertine">
                    {p.title}
                  </h3>
                  <p className="text-xs text-brand-travertine/70 leading-relaxed font-light">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
