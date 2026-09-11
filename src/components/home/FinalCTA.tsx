'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F3] overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#132339] text-[#FAF8F3] rounded-xs px-8 sm:px-14 py-12 sm:py-16 flex flex-col md:flex-row justify-between items-center gap-8 border border-[#B8912E]/30 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#B8912E]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#FAF8F3] font-semibold max-w-[16ch] leading-snug text-center md:text-left relative z-10">
            Un projet en tête ? Parlons-en aujourd'hui.
          </h2>
          <a
            href="https://wa.me/21627745403"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#B15A3C] text-[#FAF8F3] hover:bg-[#97492e] px-8 py-4 text-sm sm:text-base font-medium rounded-xs transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 whitespace-nowrap relative z-10"
          >
            Discuter sur WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
};


