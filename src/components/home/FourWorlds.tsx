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
      subtitle: 'Villas, terrains, appartements, duplex',
      desc: 'Dans toute la Tunisie, avec carte interactive et accompagnement sur-mesure.',
      cta: 'Explorer les annonces',
      href: '/properties?universe=VENTE',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=85',
      badge: 'Patrimoine',
      badgeBg: 'bg-[#B15A3C] text-white',
      accentColor: 'text-[#B15A3C]',
      borderHover: 'hover:border-[#B15A3C]/50 hover:shadow-[#B15A3C]/10',
      btnBg: 'bg-[#B15A3C]/10 text-[#B15A3C] group-hover:bg-[#B15A3C] group-hover:text-white',
    },
    {
      id: 'residence',
      title: 'Résidence & Location',
      subtitle: 'Un logement pour s\'installer',
      desc: 'Location mensuelle ou annuelle avec disponibilité vérifiée en temps réel.',
      cta: 'Trouver un logement',
      href: '/properties?universe=RESIDENCE',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=85',
      badge: 'Location',
      badgeBg: 'bg-[#132339] text-[#FAF8F3]',
      accentColor: 'text-[#132339]',
      borderHover: 'hover:border-[#132339]/50 hover:shadow-[#132339]/10',
      btnBg: 'bg-[#132339]/10 text-[#132339] group-hover:bg-[#132339] group-hover:text-white',
    },
    {
      id: 'luxe',
      title: 'Villas de luxe',
      subtitle: 'À la nuitée ou à la saison',
      desc: 'Séjours d\'exception avec piscine privée. Réservation & conciergerie.',
      cta: 'Réserver un séjour',
      href: '/villas-de-luxe',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=85',
      badge: 'Prestige',
      badgeBg: 'bg-[#B8912E] text-white',
      accentColor: 'text-[#B8912E]',
      borderHover: 'hover:border-[#B8912E]/50 hover:shadow-[#B8912E]/10',
      btnBg: 'bg-[#B8912E]/10 text-[#B8912E] group-hover:bg-[#B8912E] group-hover:text-white',
    },
    {
      id: 'event',
      title: 'Espaces Événementiels',
      subtitle: 'Jardins & piscines de réception',
      desc: 'Location pour mariages, soirées privées et tournages photographiques.',
      cta: 'Demander un devis',
      href: '/evenementiel',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=85',
      badge: 'Réceptions',
      badgeBg: 'bg-[#6E7A52] text-white',
      accentColor: 'text-[#6E7A52]',
      borderHover: 'hover:border-[#6E7A52]/50 hover:shadow-[#6E7A52]/10',
      btnBg: 'bg-[#6E7A52]/10 text-[#6E7A52] group-hover:bg-[#6E7A52] group-hover:text-white',
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
              transition={{ duration: 0.7, delay: idx * 0.12 }}
            >
              <Link
                href={card.href}
                className={`group relative bg-[#FAF8F3] border border-[rgba(19,35,57,0.14)] rounded-xs overflow-hidden flex flex-col justify-between h-full hover:shadow-2xl transition-all duration-300 ${card.borderHover}`}
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
                    <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs shadow-sm ${card.badgeBg}`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold text-[#132339] mb-1.5 group-hover:text-[#B15A3C] transition-colors">
                      {card.title}
                    </h3>
                    <p className={`text-xs font-semibold mb-3 ${card.accentColor}`}>
                      {card.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-[#2c3f57] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[rgba(19,35,57,0.08)] mt-4">
                  <span className={`text-xs font-semibold ${card.accentColor} group-hover:underline`}>
                    {card.cta}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${card.btnBg}`}>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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



