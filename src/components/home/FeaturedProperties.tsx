'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Property } from '@/types';
import { Heart } from 'lucide-react';
import { getMergedProperties } from '@/lib/clientStorage';

export const FeaturedProperties: React.FC = () => {
  const { language } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch('/api/properties');
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          setAllProperties(getMergedProperties(data.properties));
        } else {
          setAllProperties(getMergedProperties([]));
        }
      } catch (err) {
        console.warn('FeaturedProperties: API fetch error:', err);
        setAllProperties(getMergedProperties([]));
      } finally {
        setIsLoading(false);
      }
    }
    fetchProperties();
  }, []);

  const featured = allProperties.filter((p) => p.isFeatured).slice(0, 3);

  // Fallback items matching mockup if DB empty
  const displayProperties = featured.length > 0 ? featured : [
    {
      id: 'mock-1',
      title: { fr: 'Villa Les Oliviers', ar: 'فيلا الزيتون', en: 'Villa Les Oliviers' },
      universe: 'À VENDRE',
      location: { district: 'Route de la Soukra', city: 'Sfax' },
      specs: { surfaceM2: 420, bedrooms: 4 },
      price: { amount: 890000, currency: 'DT' },
      images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80' }],
      tag: 'À vendre',
      meta: 'Sfax, Route de la Soukra · 420 m² · 4 chambres',
      subPrice: 'Vue jardin & piscine'
    },
    {
      id: 'mock-2',
      title: { fr: 'Villa Azur Djerba', ar: 'فيلا أزور جربة', en: 'Villa Azur Djerba' },
      universe: 'LOCATION DE LUXE',
      location: { district: 'front de mer', city: 'Djerba' },
      specs: { surfaceM2: 350, bedrooms: 6 },
      price: { amount: 2400, currency: 'DT / nuit' },
      images: [{ url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80' }],
      tag: 'Location de luxe',
      meta: 'Djerba, front de mer · 6 chambres · Piscine chauffée',
      subPrice: 'Min. 2 nuits'
    },
    {
      id: 'mock-3',
      title: { fr: 'Domaine El Bostan', ar: 'ضيافة البستان', en: 'Domaine El Bostan' },
      universe: 'ÉVÉNEMENTIEL',
      location: { district: 'Hammamet', city: 'Hammamet' },
      specs: { surfaceM2: 3000, bedrooms: 0 },
      price: { amount: 0, currency: 'Sur devis' },
      images: [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' }],
      tag: 'Événementiel',
      meta: 'Hammamet · Jardin 3000 m² · Capacité 300 invités',
      subPrice: 'Mariages & tournages'
    }
  ];

  return (
    <section className="bg-[#132339] text-[#FAF8F3] py-20 sm:py-24">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-11">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF8F3] font-semibold max-w-[14ch]">
            Sélection du moment
          </h2>
          <Link
            href="/properties"
            className="text-sm font-medium text-[#B8912E] border-b border-[#B8912E] pb-0.5 hover:opacity-80 transition-opacity"
          >
            Voir tous les biens
          </Link>
        </div>

        {/* Listing Row Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {displayProperties.map((prop: any) => (
            <div key={prop.id} className="bg-[#2c3f57] rounded-xs overflow-hidden flex flex-col group">
              
              {/* Image & Tag */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gradient-to-tr from-[#16273f] via-[#2c3f57] to-[#B15A3C]">
                {prop.images?.[0]?.url && (
                  <Image
                    src={prop.images[0].url}
                    alt={prop.title[language] || prop.title.fr}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <span className="absolute top-3.5 left-3.5 bg-[#FAF8F3] text-[#132339] text-xs font-semibold px-2.5 py-1 rounded-xs">
                  {prop.tag || prop.universe || 'Exclusivité'}
                </span>
                
                <button
                  onClick={() => toggleFavorite(prop.id)}
                  className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur transition-all ${
                    isFavorite(prop.id)
                      ? 'bg-[#B15A3C] text-white'
                      : 'bg-[#132339]/60 text-white hover:text-[#B8912E]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite(prop.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-lg font-semibold text-[#FAF8F3] mb-1.5 line-clamp-1">
                    {prop.title[language] || prop.title.fr}
                  </h4>
                  <div className="text-xs text-[#c7cedb] mb-4 line-clamp-2">
                    {prop.meta || `${prop.location?.city || ''}, ${prop.location?.district || ''} · ${prop.specs?.surfaceM2 || ''} m²`}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/12 pt-3.5 mt-2">
                  <b className="font-serif text-base sm:text-lg text-[#FAF8F3]">
                    {prop.price.amount > 0 ? `${prop.price.amount.toLocaleString()} ${prop.price.currency}` : prop.price.currency}
                  </b>
                  <span className="text-[12.5px] text-[#c7cedb]">
                    {prop.subPrice || `${prop.specs?.bedrooms ? `${prop.specs.bedrooms} ch.` : 'Disponible'}`}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

