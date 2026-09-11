'use client';

import React from 'react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F3]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        <div className="bg-[#132339] text-[#FAF8F3] rounded-xs px-8 sm:px-14 py-12 sm:py-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#FAF8F3] font-semibold max-w-[16ch] leading-snug text-center md:text-left">
            Un projet en tête ? Parlons-en aujourd'hui.
          </h2>
          <a
            href="https://wa.me/21627745403"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#B15A3C] text-[#FAF8F3] hover:bg-[#97492e] px-7 py-3.5 text-sm sm:text-base font-medium rounded-xs transition-colors whitespace-nowrap"
          >
            Discuter sur WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

