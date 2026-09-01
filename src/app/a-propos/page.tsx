'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Shield, Compass, Award } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="pt-28 pb-24 bg-brand-navy min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-brand-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maison de Sélection Immobilière</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-brand-travertine">
            Plus qu’une adresse, une manière de vivre.
          </h1>
          <p className="text-sm sm:text-base text-brand-travertine/80 font-light leading-relaxed">
            Fondée à Sfax, Villa Regia est née de la conviction que l’immobilier de prestige et l’hospitalité d’exception reposent sur un curatage rigoureux, une discrétion absolue et un profond respect du patrimoine méditerranéen.
          </p>
        </div>

        {/* Narrative Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative h-[480px] rounded-xl overflow-hidden glass-card border border-brand-gold/30">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
              alt="Architecture Villa Regia Sfax"
              fill
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-editorial text-3xl sm:text-4xl text-brand-travertine font-light">
              Notre Ancrage à Sfax & Notre Vision
            </h2>
            <p className="text-xs sm:text-sm text-brand-travertine/80 leading-relaxed font-light">
              Sfax est une terre de rigueur, de savoir-faire artisanal et d’ambition patrimoniale. Nous accompagnons les familles, les investisseurs et les voyageurs exigeants à la recherche d’adresses singulières : des parcs d’oliviers centenaires de la Route de la Soukra aux villas maritimes de Sidi Mansour et Thyna.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <span className="font-editorial text-3xl text-brand-gold block font-normal">100%</span>
                <span className="text-xs text-brand-travertine/70">Sélection Rigoureuse & Vérifiée</span>
              </div>
              <div>
                <span className="font-editorial text-3xl text-brand-gold block font-normal">Privé</span>
                <span className="text-xs text-brand-travertine/70">Mandats & Transactions Confidentielles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="glass-navy p-12 rounded-xl border border-brand-gold/30 text-center space-y-6">
          <h2 className="font-editorial text-3xl text-brand-travertine font-light">
            Échangez avec nos conseillers privés
          </h2>
          <div className="flex justify-center gap-4">
            <Link href="/contact" className="bg-brand-gold text-brand-navy px-8 py-3.5 rounded text-xs font-bold uppercase tracking-widest">
              Nous Contacter
            </Link>
            <Link href="/proposer-un-bien" className="glass-card text-brand-travertine border border-brand-gold/30 px-8 py-3.5 rounded text-xs font-semibold uppercase tracking-widest">
              Proposer un bien
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
