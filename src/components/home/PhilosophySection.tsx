'use client';

import React from 'react';

export const PhilosophySection: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#FAF8F3]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 sm:gap-16 items-center">
        
        {/* Left Column Content */}
        <div>
          <div className="text-sm font-medium text-[#6E7A52] mb-3.5">
            Espaces & réceptions
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#132339] font-semibold max-w-[14ch] leading-tight">
            Le décor de votre prochain grand jour.
          </h2>
          <p className="mt-4 text-base text-[#2c3f57] max-w-[42ch] leading-relaxed">
            Jardins avec gazon entretenu, piscines et allées éclairées — pensés pour les mariages, les soirées privées et les tournages photo ou vidéo.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <span className="border border-[rgba(19,35,57,0.14)] px-3.5 py-2 text-xs sm:text-sm text-[#132339] rounded-xs">
              Gazon & piscine
            </span>
            <span className="border border-[rgba(19,35,57,0.14)] px-3.5 py-2 text-xs sm:text-sm text-[#132339] rounded-xs">
              Parking privé
            </span>
            <span className="border border-[rgba(19,35,57,0.14)] px-3.5 py-2 text-xs sm:text-sm text-[#132339] rounded-xs">
              Cuisine équipée
            </span>
            <span className="border border-[rgba(19,35,57,0.14)] px-3.5 py-2 text-xs sm:text-sm text-[#132339] rounded-xs">
              Éclairage soirée
            </span>
            <span className="border border-[rgba(19,35,57,0.14)] px-3.5 py-2 text-xs sm:text-sm text-[#132339] rounded-xs">
              Traiteurs partenaires
            </span>
          </div>
        </div>

        {/* Right Column Arch Visual Box */}
        <div className="relative h-[300px] sm:h-[340px] rounded-[400px_400px_12px_12px] bg-gradient-to-br from-[#6E7A52] via-[#5c6844] to-[#4d5638] overflow-hidden shadow-sm">
          <div className="absolute inset-[18px] border border-white/35 rounded-[400px_400px_12px_12px]" />
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-[#B8912E]/30 rounded-full blur-2xl" />
        </div>

      </div>
    </section>
  );
};

