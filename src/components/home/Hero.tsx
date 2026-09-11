'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="pt-32 pb-16 px-4 sm:px-8 max-w-[1180px] mx-auto min-h-[85vh] flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center w-full">
        
        {/* Left Column Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-sm sm:text-base text-[#B15A3C] font-medium mb-4 max-w-[32ch]">
            Agence immobilière basée à Sfax, active sur toute la Tunisie
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] text-[#132339] font-semibold leading-[1.05] tracking-tight max-w-[13ch]">
            Chaque bien a sa propre histoire à vivre.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#2c3f57] max-w-[44ch] leading-relaxed">
            Villa Regia accompagne la vente et la location de biens d'exception : villas, terrains, appartements — et des expériences uniques, du séjour de luxe à la réception de rêve.
          </p>

          <div className="flex flex-wrap gap-3.5 mt-8">
            <Link
              href="/properties?universe=VENTE"
              className="bg-[#B15A3C] text-[#FAF8F3] hover:bg-[#97492e] px-6 py-3.5 text-sm sm:text-base font-medium rounded-xs transition-colors shadow-sm"
            >
              Voir les biens à vendre
            </Link>
            <Link
              href="/villas-de-luxe"
              className="border border-[#132339] text-[#132339] hover:bg-[#132339] hover:text-[#FAF8F3] px-6 py-3.5 text-sm sm:text-base font-medium rounded-xs transition-colors"
            >
              Réserver une villa
            </Link>
          </div>

          <div className="flex gap-8 sm:gap-10 mt-12 pt-6 border-t border-[rgba(19,35,57,0.1)]">
            <div className="stat">
              <b className="block font-serif text-2xl sm:text-3xl font-semibold text-[#132339]">240+</b>
              <span className="text-xs sm:text-sm text-[#2c3f57]">biens gérés</span>
            </div>
            <div className="stat">
              <b className="block font-serif text-2xl sm:text-3xl font-semibold text-[#132339]">18</b>
              <span className="text-xs sm:text-sm text-[#2c3f57]">gouvernorats couverts</span>
            </div>
            <div className="stat">
              <b className="block font-serif text-2xl sm:text-3xl font-semibold text-[#132339]">4</b>
              <span className="text-xs sm:text-sm text-[#2c3f57]">métiers, une seule agence</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column Arch Art SVG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative h-[360px] sm:h-[460px] w-full flex items-center justify-center"
        >
          <svg className="w-full h-full max-h-[460px]" viewBox="0 0 420 460" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 460 V220 A170 170 0 0 1 380 220 V460" fill="none" stroke="#132339" strokeWidth="2"/>
            <path d="M80 460 V225 A130 130 0 0 1 340 225 V460" fill="none" stroke="#B8912E" strokeWidth="1.4"/>
            <path d="M120 460 V230 A90 90 0 0 1 300 230 V460" fill="#EFE8D8" stroke="#132339" strokeWidth="1.4"/>
            <circle cx="210" cy="120" r="4" fill="#B15A3C"/>
            <path d="M210 120 L210 90" stroke="#B15A3C" strokeWidth="1.4"/>
            <path d="M30 460 H390" stroke="#132339" strokeWidth="2"/>
          </svg>
        </motion.div>

      </div>
    </section>
  );
};
