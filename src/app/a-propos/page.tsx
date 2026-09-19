'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Shield, Compass, Award } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="pt-28 pb-24 bg-[#FAF8F3] text-[#132339] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B15A3C] bg-[#B15A3C]/10 border border-[#B15A3C]/25 px-3.5 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B15A3C]" />
            <span>Maison de Sélection Immobilière</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-[#132339]">
            Plus qu’une adresse, une manière de vivre.
          </h1>

          <p className="text-base sm:text-lg text-[#2c3f57] font-normal leading-relaxed">
            Fondée à Sfax, Villa Regia est née de la conviction que l’immobilier de prestige et l’hospitalité d’exception reposent sur un curatage rigoureux, une discrétion absolue et un profond respect du patrimoine méditerranéen.
          </p>
        </div>

        {/* Narrative Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative h-[480px] rounded-xl overflow-hidden bg-[#FAF8F3] border border-[rgba(19,35,57,0.14)] shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
              alt="Architecture Villa Regia Sfax"
              fill
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#132339] font-semibold">
              Notre Ancrage à Sfax & Notre Vision
            </h2>
            <p className="text-sm sm:text-base text-[#2c3f57] leading-relaxed font-normal">
              Sfax est une terre de rigueur, de savoir-faire artisanal et d’ambition patrimoniale. Nous accompagnons les familles, les investisseurs et les voyageurs exigeants à la recherche d’adresses singulières : des parcs d’oliviers centenaires de la Route Manzel Chaker Km 1.5 aux villas maritimes de Sidi Mansour et Thyna.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(19,35,57,0.12)]">
              <div>
                <span className="font-serif text-3xl text-[#B8912E] block font-bold">100%</span>
                <span className="text-xs text-[#2c3f57] font-semibold">Sélection Rigoureuse & Vérifiée</span>
              </div>
              <div>
                <span className="font-serif text-3xl text-[#B8912E] block font-bold">Privé</span>
                <span className="text-xs text-[#2c3f57] font-semibold">Mandats & Transactions Confidentielles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[#EFE8D8] p-12 rounded-xl border border-[rgba(19,35,57,0.14)] text-center space-y-6 shadow-md">
          <h2 className="font-serif text-3xl text-[#132339] font-semibold">
            Échangez avec nos conseillers privés
          </h2>
          <div className="flex justify-center gap-4">
            <Link href="/contact" className="bg-[#B15A3C] hover:bg-[#97492e] text-[#FAF8F3] px-8 py-3.5 rounded text-xs font-bold uppercase tracking-widest shadow-sm">
              Nous Contacter
            </Link>
            <Link href="/proposer-un-bien" className="bg-[#FAF8F3] text-[#132339] border border-[rgba(19,35,57,0.2)] hover:border-[#132339] px-8 py-3.5 rounded text-xs font-bold uppercase tracking-widest shadow-2xs">
              Proposer un bien
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
