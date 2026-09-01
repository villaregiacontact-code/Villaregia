'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowUpRight } from 'lucide-react';

interface PanelData {
  id: string;
  number: string;
  titleKey: string;
  descKey: string;
  href: string;
  image: string;
  category: string;
}

export const FourWorlds: React.FC = () => {
  const { t } = useLanguage();
  const [activeHoverId, setActiveHoverId] = useState<string>('vente');

  const panels: PanelData[] = [
    {
      id: 'vente',
      number: '01',
      titleKey: 'worlds.vente.title',
      descKey: 'worlds.vente.desc',
      href: '/properties?universe=VENTE',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85',
      category: 'Patrimoine & Prestigieuses Demeures',
    },
    {
      id: 'residence',
      number: '02',
      titleKey: 'worlds.residence.title',
      descKey: 'worlds.residence.desc',
      href: '/properties?universe=RESIDENCE',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
      category: 'Location Haute Saison & Annuelle',
    },
    {
      id: 'luxe',
      number: '03',
      titleKey: 'worlds.luxe.title',
      descKey: 'worlds.luxe.desc',
      href: '/villas-de-luxe',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      category: 'Villas de Prestige & Conciergerie',
    },
    {
      id: 'event',
      number: '04',
      titleKey: 'worlds.event.title',
      descKey: 'worlds.event.desc',
      href: '/evenementiel',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=85',
      category: 'Espaces d\'Exception pour Événements',
    },
  ];

  return (
    <section id="universes" className="py-24 bg-brand-navy border-t border-brand-gold/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <p className="text-xs font-mono tracking-[0.3em] uppercase text-brand-gold mb-3">
          Concept Signature
        </p>
        <h2 className="font-editorial text-3xl sm:text-5xl text-brand-travertine font-light">
          {t('worlds.title')}
        </h2>
        <p className="text-sm text-brand-travertine/70 max-w-xl mx-auto mt-4 font-light">
          {t('worlds.subtitle')}
        </p>
      </div>

      {/* Desktop 4 Vertical Expanding Panels Accordion */}
      <div className="hidden lg:flex w-full h-[620px] max-w-[1400px] mx-auto px-6 gap-4">
        {panels.map((panel) => {
          const isExpanded = activeHoverId === panel.id;
          return (
            <div
              key={panel.id}
              onMouseEnter={() => setActiveHoverId(panel.id)}
              className={`relative h-full rounded-lg overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${
                isExpanded ? 'flex-[3.5]' : 'flex-[1]'
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <Image
                  src={panel.image}
                  alt={t(panel.titleKey)}
                  fill
                  className={`object-cover transition-transform duration-1000 ${
                    isExpanded ? 'scale-105' : 'scale-100 grayscale-[40%]'
                  }`}
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isExpanded
                      ? 'bg-gradient-to-t from-brand-navy-dark via-brand-navy/60 to-transparent'
                      : 'bg-brand-navy/80 hover:bg-brand-navy/60'
                  }`}
                />
              </div>

              {/* Panel Content */}
              <div className="relative z-10 h-full p-8 flex flex-col justify-between text-brand-travertine">
                {/* Header: Number & Category */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-editorial text-3xl font-light transition-colors ${
                      isExpanded ? 'text-brand-gold' : 'text-brand-travertine/60'
                    }`}
                  >
                    {panel.number}
                  </span>
                  {isExpanded && (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-brand-gold bg-brand-navy/80 px-3 py-1 rounded border border-brand-gold/20">
                      {panel.category}
                    </span>
                  )}
                </div>

                {/* Footer: Title & Description */}
                <div>
                  <h3 className="font-editorial text-3xl xl:text-4xl font-light mb-2">
                    {t(panel.titleKey)}
                  </h3>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      <p className="text-sm text-brand-travertine/90 font-light max-w-md">
                        « {t(panel.descKey)} »
                      </p>
                      <Link
                        href={panel.href}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-gold font-bold hover:underline pt-2"
                      >
                        <span>Entrer dans cet univers</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Accordion Stack */}
      <div className="lg:hidden px-4 space-y-4">
        {panels.map((panel) => (
          <Link
            key={panel.id}
            href={panel.href}
            className="block relative h-64 rounded-lg overflow-hidden glass-card group border border-brand-gold/20"
          >
            <Image
              src={panel.image}
              alt={t(panel.titleKey)}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-brand-travertine">
              <span className="text-xs font-mono text-brand-gold">{panel.number}</span>
              <div>
                <h3 className="font-editorial text-2xl font-light">{t(panel.titleKey)}</h3>
                <p className="text-xs text-brand-travertine/80 mt-1">« {t(panel.descKey)} »</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
