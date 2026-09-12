'use client';

import React from 'react';
import Link from 'next/link';

import Image from 'next/image';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[rgba(19,35,57,0.14)] bg-[#FAF8F3] pt-14 pb-10 text-[#132339]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        
        {/* Foot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-11">
          <div>
            <div className="relative w-44 h-11 mb-3">
              <Image
                src="/images/logo-dark.jpg"
                alt="Villa Regia Real Estates Sfax"
                fill
                className="object-contain object-left rounded-xs"
              />
            </div>
            <p className="text-sm text-[#2c3f57] mb-2">
              Agence immobilière basée à Sfax, active dans toute la Tunisie.
            </p>
            <p className="text-sm text-[#2c3f57]">
              Route de la Soukra, Sfax
            </p>
          </div>

          <div>
            <h5 className="font-sans text-sm font-semibold mb-4 text-[#132339]">
              Vente
            </h5>
            <div className="flex flex-col space-y-2 text-sm text-[#2c3f57]">
              <Link href="/properties?universe=VENTE" className="hover:text-[#B15A3C] transition-colors">Villas</Link>
              <Link href="/properties?universe=VENTE" className="hover:text-[#B15A3C] transition-colors">Terrains</Link>
              <Link href="/properties?universe=VENTE" className="hover:text-[#B15A3C] transition-colors">Terrains agricoles</Link>
              <Link href="/properties?universe=VENTE" className="hover:text-[#B15A3C] transition-colors">Appartements & duplex</Link>
            </div>
          </div>

          <div>
            <h5 className="font-sans text-sm font-semibold mb-4 text-[#132339]">
              Location
            </h5>
            <div className="flex flex-col space-y-2 text-sm text-[#2c3f57]">
              <Link href="/properties?universe=RESIDENCE" className="hover:text-[#B15A3C] transition-colors">Résidence mensuelle/annuelle</Link>
              <Link href="/villas-de-luxe" className="hover:text-[#B15A3C] transition-colors">Villas de luxe</Link>
              <Link href="/evenementiel" className="hover:text-[#B15A3C] transition-colors">Espaces événementiels</Link>
            </div>
          </div>

          <div>
            <h5 className="font-sans text-sm font-semibold mb-4 text-[#132339]">
              Agence
            </h5>
            <div className="flex flex-col space-y-2 text-sm text-[#2c3f57]">
              <Link href="/proposer-un-bien" className="hover:text-[#B15A3C] transition-colors font-semibold text-[#B15A3C]">Proposer un bien</Link>
              <Link href="/a-propos" className="hover:text-[#B15A3C] transition-colors">À propos</Link>
              <Link href="/journal" className="hover:text-[#B15A3C] transition-colors">Blog & conseils</Link>
              <Link href="/contact" className="hover:text-[#B15A3C] transition-colors">Contact</Link>
              <a href="tel:+21627745403" className="hover:text-[#B15A3C] transition-colors font-mono">+216 27 745 403</a>
            </div>
          </div>
        </div>

        {/* Foot Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-[rgba(19,35,57,0.14)] text-xs text-[#2c3f57] gap-3">
          <span>© {new Date().getFullYear()} Villa Regia. Tous droits réservés.</span>
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

