'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F3] overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#EFE8D8] text-[#1A1615] rounded-xs px-8 sm:px-14 py-12 sm:py-16 flex flex-col md:flex-row justify-between items-center gap-8 border border-[rgba(26,22,21,0.14)] shadow-xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#B8912E]/15 rounded-full blur-3xl pointer-events-none" />

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1A1615] font-semibold max-w-[16ch] leading-snug text-center md:text-left relative z-10">
            Un projet en tête ? Parlons-en aujourd'hui.
          </h2>
          
          <a
            href="https://wa.me/21627745403"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba5a] text-[#1A1615] px-8 py-4 text-sm sm:text-base font-bold rounded-xs transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 whitespace-nowrap relative z-10 flex items-center gap-2.5 border border-[#1b4332]/20"
          >
            <MessageCircle className="w-5 h-5 text-[#1A1615] fill-current" />
            <span>Discuter sur WhatsApp (+216 27 745 403)</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
