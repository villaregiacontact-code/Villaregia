'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const PhilosophySection: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#FAF8F3] overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 sm:gap-16 items-center">
        
        {/* Left Column Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-sm font-medium text-[#6E7A52] tracking-wider uppercase mb-3.5">
            Espaces & réceptions
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#132339] font-semibold max-w-[14ch] leading-tight">
            Le décor de votre prochain grand jour.
          </h2>
          <p className="mt-4 text-base text-[#2c3f57] max-w-[42ch] leading-relaxed">
            Jardins avec gazon entretenu, piscines illuminées et allées majestueuses — d'exquises propriétés pensées pour vos mariages, soirées privées et tournages photographiques.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {[
              'Gazon & piscine',
              'Parking privé',
              'Cuisine équipée',
              'Éclairage soirée',
              'Traiteurs partenaires'
            ].map((chip) => (
              <span key={chip} className="border border-[rgba(19,35,57,0.14)] px-3.5 py-2 text-xs sm:text-sm text-[#132339] rounded-xs font-medium bg-[#FAF8F3]/80 hover:bg-[#132339] hover:text-[#FAF8F3] transition-colors cursor-default">
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right Column Arch Visual Box */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[340px] sm:h-[400px] rounded-[400px_400px_16px_16px] overflow-hidden shadow-2xl border-4 border-[#B8912E]/20 group"
        >
          <Image
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
            alt="Espaces & réceptions Villa Regia"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#132339]/60 via-transparent to-black/10" />
          <div className="absolute inset-[14px] border border-white/30 rounded-[390px_390px_12px_12px] pointer-events-none" />

          {/* Floating Badge */}
          <div className="absolute bottom-6 left-6 right-6 bg-[#132339]/80 backdrop-blur-md border border-[#B8912E]/30 p-4 rounded-xs text-[#FAF8F3]">
            <span className="text-xs uppercase tracking-widest text-[#B8912E] font-medium block mb-1">Espaces d'Exception</span>
            <p className="text-xs text-[#E1D6BC] leading-snug">Capacité d'accueil jusqu'à 400 convives en extérieur</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};


