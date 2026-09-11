'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-8 max-w-[1180px] mx-auto min-h-[88vh] flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 sm:gap-16 items-center w-full">
        
        {/* Left Column Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#B15A3C]/10 border border-[#B15A3C]/25 text-[#B15A3C] text-xs font-semibold uppercase tracking-wider mb-5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maison fondée à Sfax — Tunisie</span>
          </motion.div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[60px] text-[#132339] font-semibold leading-[1.04] tracking-tight max-w-[14ch]">
            Chaque bien a sa propre histoire à vivre.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#2c3f57] max-w-[44ch] leading-relaxed font-normal">
            Villa Regia accompagne la vente et la location de biens d'exception : villas, terrains, appartements — et des expériences uniques, du séjour de luxe à la réception de rêve.
          </p>

          <div className="flex flex-wrap gap-4 mt-9">
            <Link
              href="/properties?universe=VENTE"
              className="inline-flex items-center gap-2 bg-[#B15A3C] text-[#FAF8F3] hover:bg-[#97492e] px-7 py-4 text-sm sm:text-base font-medium rounded-xs transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
            >
              <span>Voir les biens à vendre</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/villas-de-luxe"
              className="inline-flex items-center justify-center border border-[#132339] text-[#132339] hover:bg-[#132339] hover:text-[#FAF8F3] px-7 py-4 text-sm sm:text-base font-medium rounded-xs transition-all hover:-translate-y-0.5"
            >
              Réserver une villa
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-8 sm:gap-12 mt-12 pt-6 border-t border-[rgba(19,35,57,0.12)]">
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

        {/* Right Column Luxury Arch Visual (Replacing Raw Line SVG) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[420px] sm:h-[500px] w-full flex items-center justify-center group"
        >
          {/* Main Arch Frame Container */}
          <div className="relative w-full h-full rounded-[400px_400px_12px_12px] overflow-hidden shadow-2xl border-2 border-[#B8912E]/40 p-2 bg-[#EFE8D8]">
            <div className="relative w-full h-full rounded-[392px_392px_8px_8px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=90"
                alt="Villa Regia Demeure d'Exception Sfax"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#132339]/60 via-transparent to-black/10" />
            </div>

            {/* Floating Luxury Glass Badge */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xs bg-[#FAF8F3]/92 backdrop-blur-md border border-[rgba(19,35,57,0.14)] shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B8912E] block">
                  Demeure d'Exception
                </span>
                <span className="font-serif text-base font-semibold text-[#132339]">
                  Villa Les Oliviers — Route de la Soukra
                </span>
              </div>
              <span className="text-xs font-semibold text-[#B15A3C] bg-[#B15A3C]/10 px-2.5 py-1 rounded-xs">
                Sfax
              </span>
            </div>
          </div>

          {/* Decorative Outer Metallic Arch Ring */}
          <div className="absolute -inset-2.5 rounded-[408px_408px_16px_16px] border border-[#B8912E]/25 pointer-events-none -z-10 hidden sm:block" />
        </motion.div>

      </div>
    </section>
  );
};

