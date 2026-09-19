'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, ShieldCheck, Sparkles, Home, Building2, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SubmitPropertyPage() {
  const whatsappUrl = `https://wa.me/21627745403?text=${encodeURIComponent(
    "Bonjour Villa Regia, je souhaite vous proposer un bien immobilier (villa, terrain, appartement, local commercial) pour vente ou location."
  )}`;

  return (
    <div className="pt-28 pb-24 bg-[#FAF8F3] text-[#132339] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B15A3C] bg-[#B15A3C]/10 border border-[#B15A3C]/25 px-4 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B15A3C]" />
            <span>Service Propriétaires Prestige & Discrétion</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-[#132339] leading-tight">
            Proposer votre bien immobilier à Villa Regia
          </h1>
          
          <p className="text-base sm:text-lg text-[#2c3f57] font-normal leading-relaxed max-w-2xl mx-auto">
            Vous souhaitez vendre ou louer une villa, un terrain, un appartement ou un espace commercial à Sfax ou en Tunisie ? Contactez directement nos conseillers privés par téléphone ou WhatsApp.
          </p>
        </div>

        {/* Primary Direct Contact Cards (NO FORMS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Card 1: WhatsApp DM Direct */}
          <div className="bg-[#FAF8F3] p-8 rounded-2xl border-2 border-[#25D366]/40 shadow-xl space-y-6 flex flex-col justify-between hover:border-[#25D366] transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#132339]">
                <MessageCircle className="w-7 h-7 text-[#1b4332] fill-current" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase font-bold text-[#1b4332] block tracking-wider">
                  Contact Instantané
                </span>
                <h2 className="font-serif text-2xl font-semibold text-[#132339] mt-1">
                  Discuter sur WhatsApp
                </h2>
                <p className="text-xs text-[#2c3f57] mt-2 leading-relaxed">
                  Envoyez les photos, détails ou localisation de votre bien directement à notre équipe de conciergerie privée.
                </p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-[#132339] font-bold text-xs uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md transition-all text-center border border-[#1b4332]/20"
            >
              <MessageCircle className="w-4 h-4 fill-current text-[#132339]" />
              <span>Ouvrir WhatsApp DM (+216 27 745 403)</span>
            </a>
          </div>

          {/* Card 2: Phone Call Direct */}
          <div className="bg-[#FAF8F3] p-8 rounded-2xl border-2 border-[#B15A3C]/40 shadow-xl space-y-6 flex flex-col justify-between hover:border-[#B15A3C] transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#B15A3C]/15 border border-[#B15A3C]/30 flex items-center justify-center text-[#132339]">
                <Phone className="w-7 h-7 text-[#96472e]" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase font-bold text-[#96472e] block tracking-wider">
                  Ligne Téléphonique Directe
                </span>
                <h2 className="font-serif text-2xl font-semibold text-[#132339] mt-1">
                  Appeler un Conseiller
                </h2>
                <p className="text-xs text-[#2c3f57] mt-2 leading-relaxed">
                  Échangez immédiatement de vive voix avec un expert immobilier Villa Regia pour l'estimation de votre bien.
                </p>
              </div>
            </div>

            <a
              href="tel:+21627745403"
              className="w-full bg-[#B15A3C] hover:bg-[#96472e] text-[#FAF8F3] font-bold text-xs uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md transition-all text-center border border-[#132339]/20"
            >
              <Phone className="w-4 h-4 text-[#FAF8F3]" />
              <span>Appeler le +216 27 745 403</span>
            </a>
          </div>

        </div>

        {/* Guarantees & Information Section */}
        <div className="bg-[#EFE8D8] p-8 rounded-2xl border border-[rgba(19,35,57,0.14)] max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-[rgba(19,35,57,0.12)] pb-4">
            <ShieldCheck className="w-6 h-6 text-[#B8912E] shrink-0" />
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#132339]">
                Engagement de Discrétion & Sécurité Juridique
              </h3>
              <p className="text-xs text-[#2c3f57]">
                Pourquoi faire confiance à la Maison Villa Regia Sfax ?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="font-serif text-2xl font-bold text-[#B15A3C] block">1. Confidentialité</span>
              <p className="text-xs text-[#2c3f57] leading-relaxed">
                Diffusion sur mesure de votre bien sans exposition inutile des coordonnées de votre propriété.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-serif text-2xl font-bold text-[#B8912E] block">2. Estimation juste</span>
              <p className="text-xs text-[#2c3f57] leading-relaxed">
                Étude comparative du marché immobilier sfaxien et tunisien par nos spécialistes chevronnés.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-serif text-2xl font-bold text-[#6E7A52] block">3. Suivi complet</span>
              <p className="text-xs text-[#2c3f57] leading-relaxed">
                Prise en charge des visites sélectionnées, rédaction des compromis et accompagnement juridique final.
              </p>
            </div>
          </div>
        </div>

        {/* Agency Location Card */}
        <div className="p-6 rounded-xl bg-[#FAF8F3] border border-[rgba(19,35,57,0.14)] max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#B15A3C] shrink-0" />
            <div>
              <h4 className="font-serif text-base font-semibold text-[#132339]">Siège Agence Villa Regia</h4>
              <span className="text-xs text-[#2c3f57]">Route Manzel Chaker Km 1.5 — 3000 Sfax, Tunisie</span>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#132339] border border-[rgba(19,35,57,0.2)] px-4 py-2.5 rounded-lg hover:bg-[#EFE8D8] transition-colors"
          >
            <span>Voir la page contact</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
