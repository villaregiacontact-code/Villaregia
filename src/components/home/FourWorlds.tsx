'use client';

import React from 'react';
import Link from 'next/link';

export const FourWorlds: React.FC = () => {
  return (
    <section id="universes" className="py-16 sm:py-24 bg-[#FAF8F3]">
      {/* Header */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#132339] font-semibold max-w-[16ch] leading-tight">
          Quatre façons de vivre un bien Villa Regia
        </h2>
        <p className="text-sm sm:text-base text-[#2c3f57] max-w-[36ch]">
          Chaque activité a son propre parcours, pensé pour son client : acheteur, résident, vacancier ou organisateur d'événement.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[rgba(19,35,57,0.14)] bg-[#FAF8F3]">
          
          {/* Card 1 */}
          <Link
            href="/properties?universe=VENTE"
            className="group p-8 border-b sm:border-b-0 sm:border-r border-[rgba(19,35,57,0.14)] min-h-[340px] flex flex-col justify-between hover:bg-[#EFE8D8] transition-colors duration-200"
          >
            <div>
              <svg className="w-11 h-11 mb-6" viewBox="0 0 46 46">
                <rect x="6" y="18" width="34" height="22" fill="none" stroke="#132339" strokeWidth="1.6"/>
                <path d="M4 20 L23 6 L42 20" fill="none" stroke="#132339" strokeWidth="1.6"/>
                <line x1="23" y1="26" x2="23" y2="40" stroke="#B15A3C" strokeWidth="1.6"/>
              </svg>
              <h3 className="font-serif text-xl font-semibold text-[#132339] mb-2 max-w-[14ch]">
                Vente de biens
              </h3>
              <p className="text-sm text-[#2c3f57] leading-relaxed">
                Villas, terrains, terrains agricoles, appartements, duplex — dans toute la Tunisie, avec carte interactive et simulation de financement.
              </p>
            </div>
            <span className="text-sm font-semibold text-[#B15A3C] group-hover:underline mt-6">
              Explorer les annonces →
            </span>
          </Link>

          {/* Card 2 */}
          <Link
            href="/properties?universe=RESIDENCE"
            className="group p-8 border-b sm:border-b-0 lg:border-r border-[rgba(19,35,57,0.14)] min-h-[340px] flex flex-col justify-between hover:bg-[#EFE8D8] transition-colors duration-200"
          >
            <div>
              <svg className="w-11 h-11 mb-6" viewBox="0 0 46 46">
                <rect x="8" y="8" width="30" height="30" fill="none" stroke="#132339" strokeWidth="1.6"/>
                <line x1="8" y1="20" x2="38" y2="20" stroke="#132339" strokeWidth="1.6"/>
                <line x1="20" y1="20" x2="20" y2="38" stroke="#132339" strokeWidth="1.6"/>
              </svg>
              <h3 className="font-serif text-xl font-semibold text-[#132339] mb-2 max-w-[14ch]">
                Résidence, mensuelle ou annuelle
              </h3>
              <p className="text-sm text-[#2c3f57] leading-relaxed">
                Un logement pour vivre, avec candidature en ligne et disponibilité mise à jour en temps réel.
              </p>
            </div>
            <span className="text-sm font-semibold text-[#B15A3C] group-hover:underline mt-6">
              Trouver un logement →
            </span>
          </Link>

          {/* Card 3 */}
          <Link
            href="/villas-de-luxe"
            className="group p-8 border-b sm:border-b-0 sm:border-r border-[rgba(19,35,57,0.14)] min-h-[340px] flex flex-col justify-between hover:bg-[#EFE8D8] transition-colors duration-200"
          >
            <div>
              <svg className="w-11 h-11 mb-6" viewBox="0 0 46 46">
                <circle cx="23" cy="23" r="15" fill="none" stroke="#132339" strokeWidth="1.6"/>
                <path d="M23 8 V23 L32 30" stroke="#B15A3C" strokeWidth="1.6" fill="none"/>
              </svg>
              <h3 className="font-serif text-xl font-semibold text-[#132339] mb-2 max-w-[14ch]">
                Villas de luxe, à la nuitée ou à l'année
              </h3>
              <p className="text-sm text-[#2c3f57] leading-relaxed">
                Séjours d'exception avec piscine privée. Calendrier en direct, réservation et acompte en ligne.
              </p>
            </div>
            <span className="text-sm font-semibold text-[#B15A3C] group-hover:underline mt-6">
              Réserver un séjour →
            </span>
          </Link>

          {/* Card 4 */}
          <Link
            href="/evenementiel"
            className="group p-8 min-h-[340px] flex flex-col justify-between hover:bg-[#EFE8D8] transition-colors duration-200"
          >
            <div>
              <svg className="w-11 h-11 mb-6" viewBox="0 0 46 46">
                <path d="M6 38 Q23 14 40 38" fill="none" stroke="#132339" strokeWidth="1.6"/>
                <circle cx="23" cy="30" r="4" fill="#B15A3C"/>
              </svg>
              <h3 className="font-serif text-xl font-semibold text-[#132339] mb-2 max-w-[14ch]">
                Espaces pour événements
              </h3>
              <p className="text-sm text-[#2c3f57] leading-relaxed">
                Jardins et piscines à louer pour mariages, soirées et tournages, avec devis instantané.
              </p>
            </div>
            <span className="text-sm font-semibold text-[#B15A3C] group-hover:underline mt-6">
              Demander un devis →
            </span>
          </Link>

        </div>
      </div>
    </section>
  );
};

