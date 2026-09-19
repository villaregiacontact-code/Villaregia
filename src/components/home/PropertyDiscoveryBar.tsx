'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { UniverseType, PropertyCategory } from '@/types';
import { Search, MapPin, Building2, Tag } from 'lucide-react';

export const PropertyDiscoveryBar: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const [universe, setUniverse] = useState<UniverseType | 'ALL'>('ALL');
  const [category, setCategory] = useState<PropertyCategory | 'ALL'>('ALL');
  const [city, setCity] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (universe !== 'ALL') params.append('universe', universe);
    if (category !== 'ALL') params.append('category', category);
    if (city.trim()) params.append('city', city.trim());

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="relative z-20 max-w-6xl mx-auto -mt-12 px-4 sm:px-6">
      <div className="bg-[#FAF8F3] rounded-xl p-6 shadow-2xl border border-[rgba(19,35,57,0.14)] text-[#132339]">
        
        {/* Universe Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-[rgba(19,35,57,0.12)] pb-4">
          <span className="text-xs uppercase tracking-widest text-[#2c3f57] font-semibold self-center mr-2 rtl:ml-2">
            {t('search.title')}
          </span>
          
          {(['ALL', 'VENTE', 'RESIDENCE', 'LUXE', 'EVENT'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUniverse(u)}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                universe === u
                  ? 'bg-[#B15A3C] text-[#FAF8F3] shadow-md'
                  : 'bg-[#EFE8D8] text-[#2c3f57] hover:bg-[#132339] hover:text-[#FAF8F3]'
              }`}
            >
              {u === 'ALL'
                ? t('search.all_universes')
                : u === 'VENTE'
                ? t('nav.sale')
                : u === 'RESIDENCE'
                ? t('nav.residence')
                : u === 'LUXE'
                ? t('nav.luxe')
                : t('nav.event')}
            </button>
          ))}
        </div>

        {/* Dynamic Form Inputs */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Location Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#B15A3C] font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#B15A3C]" />
              Secteur / Ville
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t('search.city_placeholder')}
              className="w-full bg-white border border-[rgba(19,35,57,0.18)] rounded px-3.5 py-2.5 text-xs text-[#132339] placeholder-[#2c3f57]/50 focus:outline-none focus:border-[#B15A3C] transition-colors"
            />
          </div>

          {/* Property Category Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#B15A3C] font-semibold flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#B15A3C]" />
              Type de bien
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PropertyCategory | 'ALL')}
              className="w-full bg-white border border-[rgba(19,35,57,0.18)] rounded px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B15A3C] transition-colors font-medium"
            >
              <option value="ALL">{t('search.all_types')}</option>
              <option value="Villa">Villa de Maître</option>
              <option value="Appartement">Appartement Standing</option>
              <option value="Duplex">Duplex Vista</option>
              <option value="Penthouse">Penthouse Rooftop</option>
              <option value="Terrain">Terrain Constructible</option>
              <option value="Domaine Événementiel">Domaine Événementiel</option>
            </select>
          </div>

          {/* Universe Specific Helper Tag */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#B15A3C] font-semibold flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#B15A3C]" />
              Spécificité
            </label>
            <div className="w-full bg-[#EFE8D8] border border-[rgba(19,35,57,0.14)] rounded px-3.5 py-2.5 text-xs text-[#132339] font-medium flex items-center justify-between">
              <span>
                {universe === 'VENTE'
                  ? 'Patrimoine Foncier'
                  : universe === 'LUXE'
                  ? 'Piscine & Conciergerie'
                  : universe === 'EVENT'
                  ? 'Espaces Mariages/Seminaires'
                  : 'Résidence Meublée'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-[#B15A3C] hover:bg-[#96472e] text-[#FAF8F3] font-bold text-xs uppercase tracking-widest py-3 px-6 rounded flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Search className="w-4 h-4 text-[#FAF8F3]" />
              <span>{t('search.button')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
