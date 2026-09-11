'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export const FourWorlds: React.FC = () => {
  const cards = [
    {
      id: 'vente',
      title: 'Vente de biens',
      subtitle: 'Villas, terrains, terrains agricoles, appartements, duplex',
      desc: 'Dans toute la Tunisie, avec carte interactive et simulation de financement.',
      cta: 'Explorer les annonces',
      href: '/properties?universe=VENTE',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=85',
      badge: 'Patrimoine',
    },
    {
      id: 'residence',
      title: 'Résidence, mensuelle ou annuelle',
      subtitle: 'Un logement pour vivre',
      desc: 'Candidature en ligne et disponibilité mise à jour en temps réel.',
      cta: 'Trouver un logement',
      href: '/properties?universe=RESIDENCE',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=85',
      badge: 'Location',
    },
    {
      id: 'luxe',
      title: 'Villas de luxe',
      subtitle: 'À la nuitée ou à l\'année',
      desc: 'Séjours d\'exception avec piscine privée. Calendrier en direct & réservation.',
      cta: 'Réserver un séjour',
      href: '/villas-de-luxe',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=85',
      badge: 'Prestige',
    },
    {
      id: 'event',
      title: 'Espaces pour événements',
      subtitle: 'Jardins & piscines de réception',
      desc: 'Location pour mariages, soirées et tournages, avec devis instantané.',
      cta: 'Demander un devis',
      href: '/evenementiel',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=85',
      badge: 'Réceptions',
    },
  ];

  return (
    <section id="universes" className="py-20 sm:py-28 bg-[#FAF8F3]">
      {/* Header */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B15A3C] block mb-2">
            Quatre Univers Signature
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#132339] font-semibold max-w-[16ch] leading-tight">
            Quatre façons de vivre un bien Villa Regia
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm sm:text-base text-[#2c3f57] max-w-[36ch] leading-relaxed"
        >
          Chaque activité a son propre parcours, pensé pour son client : acheteur, résident, vacancier ou organisateur d'événement.
        </motion.p>
      </div>

      {/* Grid Cards */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
            >
              <Link
                href={card.href}
                className="group relative bg-[#FAF8F3] border border-[rgba(19,35,57,0.14)] rounded-xs overflow-hidden flex flex-col justify-between h-full hover:shadow-xl hover:border-[#B8912E]/40 transition-all duration-300"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#EFE8D8]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#132339]/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-[#FAF8F3] text-[#132339] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs shadow-sm">
                      {card.badge}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold text-[#132339] mb-1.5 group-hover:text-[#B15A3C] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#B8912E] mb-3">
                      {card.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-[#2c3f57] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[rgba(19,35,57,0.08)] mt-4">
                  <span className="text-xs font-semibold text-[#B15A3C] group-hover:underline">
                    {card.cta}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#B15A3C]/10 flex items-center justify-center text-[#B15A3C] group-hover:bg-[#B15A3C] group-hover:text-white transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


