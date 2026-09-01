'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { UniverseType, PropertyCategory } from '@/types';
import { Search, SlidersHorizontal, MapPin, Building2, Tag } from 'lucide-react';

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
      <div className="glass-navy rounded-xl p-6 shadow-2xl border border-brand-gold/30">
        
        {/* Universe Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
          <span className="text-xs uppercase tracking-widest text-brand-travertine/60 self-center mr-2 rtl:ml-2">
            {t('search.title')}
          </span>
          
          {(['ALL', 'VENTE', 'RESIDENCE', 'LUXE', 'EVENT'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUniverse(u)}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                universe === u
                  ? 'bg-brand-gold text-brand-navy shadow-md shadow-brand-gold/20'
                  : 'bg-white/5 text-brand-travertine/80 hover:bg-white/10 hover:text-brand-gold'
              }`}
            >
              {u === 'ALL'
                ? t('search.all_universes')
                : u === 'VENTE'
                ? 'Vente'
                : u === 'RESIDENCE'
                ? 'Résidence'
                : u === 'LUXE'
                ? 'Villas Luxe'
                : 'Événementiel'}
            </button>
          ))}
        </div>

        {/* Dynamic Form Inputs */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Location Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-brand-gold flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Secteur / Ville
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t('search.city_placeholder')}
              className="w-full bg-brand-navy/80 border border-white/15 rounded px-3.5 py-2.5 text-xs text-brand-travertine placeholder-brand-travertine/40 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>

          {/* Property Category Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-brand-gold flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Type de bien
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PropertyCategory | 'ALL')}
              className="w-full bg-brand-navy/80 border border-white/15 rounded px-3.5 py-2.5 text-xs text-brand-travertine focus:outline-none focus:border-brand-gold transition-colors"
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
            <label className="text-[10px] font-mono uppercase tracking-widest text-brand-gold flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Spécificité
            </label>
            <div className="w-full bg-brand-navy/50 border border-white/10 rounded px-3.5 py-2.5 text-xs text-brand-travertine/70 flex items-center justify-between">
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
              className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark hover:opacity-95 text-brand-navy font-bold text-xs uppercase tracking-widest py-3 px-6 rounded flex items-center justify-center gap-2 shadow-xl shadow-brand-gold/20 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>{t('search.button')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
