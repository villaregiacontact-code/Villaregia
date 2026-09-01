'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoritesContext';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { Heart, MapPin, Maximize2, Bed, Bath, ArrowUpRight, Sparkles } from 'lucide-react';

export const FeaturedProperties: React.FC = () => {
  const { t, language } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const featured = INITIAL_PROPERTIES.filter((p) => p.isFeatured).slice(0, 3);

  return (
    <section className="py-24 bg-brand-navy border-t border-brand-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase text-brand-gold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sélection d’Exception</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-brand-travertine font-light">
              Propriétés Remarquables
            </h2>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-gold font-bold hover:underline"
          >
            <span>Consulter le portfolio complet</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Editorial Layout: Large Highlight + 2 Grid Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Large Hero Feature (Left Col-7) */}
          {featured[0] && (
            <div className="lg:col-span-7 group relative rounded-xl overflow-hidden glass-card border border-brand-gold/20 flex flex-col justify-between min-h-[520px]">
              {/* Image & Overlay */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <Image
                  src={featured[0].images[0].url}
                  alt={featured[0].title[language]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
              </div>

              {/* Top Badges */}
              <div className="relative z-10 p-6 flex justify-between items-start">
                <div className="flex gap-2">
                  <span className="bg-brand-gold text-brand-navy font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded shadow">
                    {featured[0].universe}
                  </span>
                  {featured[0].isNew && (
                    <span className="bg-white/20 backdrop-blur text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded">
                      Nouveau
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleFavorite(featured[0].id)}
                  className={`p-2.5 rounded-full backdrop-blur transition-all ${
                    isFavorite(featured[0].id)
                      ? 'bg-brand-gold text-brand-navy'
                      : 'bg-brand-navy/60 text-white hover:text-brand-gold'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(featured[0].id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Bottom Specs & Title */}
              <div className="relative z-10 p-8 space-y-4 text-brand-travertine">
                <div className="flex items-center gap-2 text-xs text-brand-gold font-mono uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{featured[0].location.district}, {featured[0].location.city}</span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl font-light leading-snug">
                  {featured[0].title[language]}
                </h3>

                <p className="text-xs text-brand-travertine/80 font-light line-clamp-2">
                  {featured[0].description[language]}
                </p>

                {/* Specs Row */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-brand-travertine/70">
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-brand-gold" />
                      {featured[0].specs.surfaceM2} m²
                    </span>
                    {featured[0].specs.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-brand-gold" />
                        {featured[0].specs.bedrooms} ch.
                      </span>
                    )}
                    {featured[0].specs.pool && (
                      <span className="text-brand-gold text-[11px] font-mono uppercase">Piscine</span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-editorial text-2xl font-normal text-brand-gold">
                      {featured[0].price.amount.toLocaleString()} {featured[0].price.currency}
                    </span>
                    {featured[0].price.period && (
                      <span className="text-[10px] text-brand-travertine/60 block uppercase">
                        / {featured[0].price.period}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/properties/${featured[0].id}`}
                  className="block w-full text-center bg-brand-gold/15 hover:bg-brand-gold hover:text-brand-navy text-brand-gold py-3 rounded text-xs font-bold uppercase tracking-widest transition-all mt-4"
                >
                  {t('btn.discover')}
                </Link>
              </div>
            </div>
          )}

          {/* Secondary Stack (Right Col-5) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {featured.slice(1).map((prop) => (
              <div
                key={prop.id}
                className="group relative rounded-xl overflow-hidden glass-card border border-brand-gold/20 flex flex-col justify-between p-6 hover:border-brand-gold/50 transition-all"
              >
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={prop.images[0].url}
                    alt={prop.title[language]}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-brand-gold text-brand-navy font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded shadow">
                      {prop.universe}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFavorite(prop.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur transition-all ${
                      isFavorite(prop.id)
                        ? 'bg-brand-gold text-brand-navy'
                        : 'bg-brand-navy/60 text-white hover:text-brand-gold'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite(prop.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-brand-gold font-mono uppercase">
                    <MapPin className="w-3 h-3" />
                    <span>{prop.location.district}, {prop.location.city}</span>
                  </div>
                  <h4 className="font-editorial text-xl font-light text-brand-travertine line-clamp-1">
                    {prop.title[language]}
                  </h4>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-xs text-brand-travertine/70">
                      {prop.specs.surfaceM2} m² • {prop.specs.bedrooms ? `${prop.specs.bedrooms} ch.` : prop.category}
                    </span>
                    <span className="font-editorial text-lg font-normal text-brand-gold">
                      {prop.price.amount.toLocaleString()} {prop.price.currency}
                    </span>
                  </div>

                  <Link
                    href={`/properties/${prop.id}`}
                    className="block text-center text-xs uppercase tracking-widest text-brand-gold font-bold hover:underline pt-2"
                  >
                    {t('btn.discover')} →
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
