'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoritesContext';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { Property, UniverseType, PropertyCategory } from '@/types';
import { getMergedProperties } from '@/lib/clientStorage';

// ─── Category definitions ──────────────────────────────────────────────────
import {
  Grid,
  List,
  MapPin,
  Heart,
  Maximize2,
  Bed,
  Search,
  X,
  Sparkles,
  Home,
  Building2,
  Layers,
  Crown,
  CalendarCheck,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  RotateCcw,
  Waves,
  Hammer,
  Store,
  Briefcase,
} from 'lucide-react';

// ─── Category definitions ──────────────────────────────────────────────────
const CATEGORIES: { value: PropertyCategory | 'ALL'; label: string; icon: React.ElementType; count?: number }[] = [
  { value: 'ALL', label: 'Tout le Catalogue', icon: Sparkles },
  { value: 'Villa', label: 'Villas', icon: Home },
  { value: 'Villa Semi-Construite', label: 'Villas Semi-Construites', icon: Hammer },
  { value: 'Espace Commercial', label: 'Espaces Commerciaux', icon: Store },
  { value: 'Fonds de Commerce', label: 'Fonds de Commerce', icon: Briefcase },
  { value: 'Appartement', label: 'Appartements', icon: Building2 },
  { value: 'Duplex', label: 'Duplex', icon: Layers },
  { value: 'Penthouse', label: 'Penthouses', icon: Crown },
  { value: 'Domaine Événementiel', label: 'Domaines', icon: CalendarCheck },
];

const UNIVERSES: { value: UniverseType | 'ALL'; label: string; color: string }[] = [
  { value: 'ALL', label: 'Tous', color: 'bg-white/10 text-white/70 border-white/20' },
  { value: 'VENTE', label: 'Vente', color: 'bg-[#B15A3C]/30 text-[#FAF8F3] border-[#B15A3C]/60' },
  { value: 'RESIDENCE', label: 'Résidence', color: 'bg-white/15 text-[#FAF8F3] border-white/30' },
  { value: 'LUXE', label: 'Séjour Luxe', color: 'bg-[#B8912E]/30 text-amber-200 border-[#B8912E]/60' },
  { value: 'EVENT', label: 'Événementiel', color: 'bg-[#6E7A52]/30 text-emerald-200 border-[#6E7A52]/60' },
];


const SORT_OPTIONS = [
  { value: 'featured', label: 'Sélection Villa Regia' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'surface_desc', label: 'Surface décroissante' },
  { value: 'newest', label: 'Nouveautés' },
];

// ─── Category icon background ─────────────────────────────────────────────
const CAT_ACTIVE: Record<string, string> = {
  ALL: 'from-brand-gold/30 to-brand-gold-dark/20 border-brand-gold/50 text-brand-gold',
  Villa: 'from-amber-500/30 to-amber-600/20 border-amber-500/50 text-amber-300',
  'Villa Semi-Construite': 'from-orange-500/30 to-orange-600/20 border-orange-500/50 text-orange-300',
  'Espace Commercial': 'from-amber-500/30 to-amber-600/20 border-amber-500/50 text-amber-300',
  'Fonds de Commerce': 'from-brand-terracotta/30 to-brand-terracotta/20 border-brand-terracotta/50 text-brand-terracotta',
  Appartement: 'from-amber-500/30 to-amber-600/20 border-amber-500/50 text-amber-300',
  Duplex: 'from-violet-500/30 to-violet-600/20 border-violet-500/50 text-violet-300',
  Penthouse: 'from-rose-500/30 to-rose-600/20 border-rose-500/50 text-rose-300',
  'Domaine Événementiel': 'from-purple-500/30 to-purple-600/20 border-purple-500/50 text-purple-300',
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const initialUniverse = (searchParams?.get('universe') as UniverseType) || 'ALL';
  const initialCategory = (searchParams?.get('category') as PropertyCategory) || 'ALL';
  const initialCity = searchParams?.get('city') || '';
  const initialSavedOnly = searchParams?.get('saved') === 'true';

  const [universeFilter, setUniverseFilter] = useState<UniverseType | 'ALL'>(initialUniverse);
  const [categoryFilter, setCategoryFilter] = useState<PropertyCategory | 'ALL'>(initialCategory);
  const [searchCity, setSearchCity] = useState(initialCity);
  const [showSavedOnly, setShowSavedOnly] = useState(initialSavedOnly);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [minSurface, setMinSurface] = useState<number>(0);
  const [sortBy, setSortBy] = useState('featured');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [propertiesList, setPropertiesList] = useState<Property[]>(INITIAL_PROPERTIES);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(true);

  React.useEffect(() => {
    async function fetchLiveProperties() {
      try {
        setLoadingProperties(true);
        const res = await fetch('/api/properties');
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          setPropertiesList(getMergedProperties(data.properties));
        } else {
          setPropertiesList(getMergedProperties(INITIAL_PROPERTIES));
        }
      } catch (err) {
        console.warn('API fetch properties fallback:', err);
        setPropertiesList(getMergedProperties(INITIAL_PROPERTIES));
      } finally {
        setLoadingProperties(false);
      }
    }
    fetchLiveProperties();
  }, []);

  // Category counts
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: propertiesList.length };
    propertiesList.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [propertiesList]);

  const activeFiltersCount = [
    universeFilter !== 'ALL',
    categoryFilter !== 'ALL',
    !!searchCity,
    showSavedOnly,
    minSurface > 0,
    maxPrice < 5000000,
  ].filter(Boolean).length;

  const filteredAndSorted = useMemo(() => {
    let result = propertiesList.filter((p) => {
      if (universeFilter !== 'ALL' && p.universe !== universeFilter) return false;
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (searchCity && !p.location.city.toLowerCase().includes(searchCity.toLowerCase()) && !p.location.district.toLowerCase().includes(searchCity.toLowerCase())) return false;
      if (showSavedOnly && !isFavorite(p.id)) return false;
      if (p.price.amount > maxPrice) return false;
      if (p.specs.surfaceM2 < minSurface) return false;
      return true;
    });

    switch (sortBy) {
      case 'price_asc': result = [...result].sort((a, b) => a.price.amount - b.price.amount); break;
      case 'price_desc': result = [...result].sort((a, b) => b.price.amount - a.price.amount); break;
      case 'surface_desc': result = [...result].sort((a, b) => b.specs.surfaceM2 - a.specs.surfaceM2); break;
      case 'newest': result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      default: result = [...result].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)); break;
    }
    return result;
  }, [propertiesList, universeFilter, categoryFilter, searchCity, showSavedOnly, maxPrice, minSurface, sortBy, isFavorite]);

  const resetAll = () => {
    setUniverseFilter('ALL');
    setCategoryFilter('ALL');
    setSearchCity('');
    setShowSavedOnly(false);
    setMinSurface(0);
    setMaxPrice(5000000);
    setSortBy('featured');
  };

  return (
    <div className="pt-28 pb-24 bg-[#FAF8F3] min-h-screen text-[#1A1615]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B15A3C] bg-[#B15A3C]/10 border border-[#B15A3C]/20 px-3.5 py-1 rounded-full mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('catalog.badge')}</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#1A1615]">
            {t('catalog.title')}
          </h1>
          <p className="text-base text-[#443E3B] mt-3 max-w-xl mx-auto font-normal leading-relaxed">
            {t('catalog.subtitle')}
          </p>
        </div>

        {/* ── FILTER PANEL ── */}
        <div className="mb-8 space-y-4">

          {/* ── Category Chips (Main Type Filter) ── */}
          <div className="overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2.5 min-w-max sm:flex-wrap sm:min-w-0">
              {CATEGORIES.map(({ value, label, icon: Icon }) => {
                const isActive = categoryFilter === value;
                const count = catCounts[value] || 0;
                return (
                  <button
                    key={value}
                    onClick={() => setCategoryFilter(value as PropertyCategory | 'ALL')}
                    className={`group relative flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xs border transition-all duration-200 shrink-0 snap-start ${
                      isActive
                        ? 'bg-[#1A1615] text-[#FAF8F3] border-[#1A1615] shadow-md font-semibold'
                        : 'bg-[#FAF8F3] border-[rgba(26,22,21,0.14)] text-[#443E3B] hover:border-[#1A1615] hover:text-[#1A1615]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#B8912E]' : 'group-hover:text-[#1A1615]'}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                    {value !== 'ALL' && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#FAF8F3]/20 text-[#FAF8F3]' : 'bg-[#1A1615]/10 text-[#1A1615]'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Universe Pills + Search + Sort + View Toggle ── */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Universe filter pills */}
            <div className="flex flex-wrap gap-2">
              {UNIVERSES.map(({ value, label }) => {
                const isActive = universeFilter === value;
                return (
                  <button
                    key={value}
                    onClick={() => setUniverseFilter(value as UniverseType | 'ALL')}
                    className={`px-3.5 py-1.5 rounded-full border text-[11px] font-semibold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-[#1A1615] text-[#FAF8F3] border-[#1A1615] shadow-sm'
                        : 'bg-[#FAF8F3] border-[rgba(26,22,21,0.14)] text-[#443E3B] hover:border-[#1A1615]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1" />

            {/* Search city */}
            <div className="relative w-full sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#443E3B]/60" />
              <input
                type="text"
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
                placeholder="Quartier, secteur…"
                className="w-full bg-[#FAF8F3] border border-[rgba(26,22,21,0.18)] rounded-xs pl-9 pr-8 py-2 text-xs text-[#1A1615] placeholder:text-[#443E3B]/50 focus:outline-none focus:border-[#B15A3C] transition-all"
              />
              {searchCity && (
                <button onClick={() => setSearchCity('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#443E3B]/60 hover:text-[#1A1615]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-[#FAF8F3] border border-[rgba(26,22,21,0.18)] rounded-xs pl-4 pr-9 py-2 text-xs text-[#1A1615] font-medium focus:outline-none focus:border-[#B15A3C] transition-all cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#443E3B]/60 pointer-events-none" />
            </div>

            {/* Advanced filters toggle */}
            <button onClick={() => setShowAdvanced(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xs border text-xs font-semibold uppercase tracking-wider transition-all ${
                showAdvanced || activeFiltersCount > 0
                  ? 'bg-[#B15A3C] border-[#B15A3C] text-white'
                  : 'bg-[#FAF8F3] border-[rgba(26,22,21,0.18)] text-[#443E3B] hover:border-[#1A1615]'
              }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#FAF8F3] text-[#1A1615] text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-[#FAF8F3] border border-[rgba(26,22,21,0.18)] rounded-xs p-1">
              <button onClick={() => setViewMode('grid')} title="Grille"
                className={`p-1.5 rounded-xs transition-all ${viewMode === 'grid' ? 'bg-[#1A1615] text-[#FAF8F3]' : 'text-[#443E3B]/60 hover:text-[#1A1615]'}`}>
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('list')} title="Liste"
                className={`p-1.5 rounded-xs transition-all ${viewMode === 'list' ? 'bg-[#1A1615] text-[#FAF8F3]' : 'text-[#443E3B]/60 hover:text-[#1A1615]'}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Advanced Filters Drawer ── */}
          {showAdvanced && (
            <div className="bg-[#EFE8D8] border border-[rgba(26,22,21,0.14)] rounded-xs p-5 space-y-5 animate-fade-in text-[#1A1615]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Surface slider */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#B15A3C] block mb-2">
                    Surface minimum — {minSurface} m²
                  </label>
                  <input type="range" min={0} max={1000} step={50} value={minSurface}
                    onChange={e => setMinSurface(Number(e.target.value))}
                    className="w-full accent-[#B15A3C] cursor-pointer h-1 rounded-full" />
                  <div className="flex justify-between text-[10px] text-[#443E3B] font-mono mt-1">
                    <span>0 m²</span><span>1000 m²</span>
                  </div>
                </div>
                {/* Price slider */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#B15A3C] block mb-2">
                    Prix maximum — {maxPrice.toLocaleString('fr-TN')} TND
                  </label>
                  <input type="range" min={500000} max={5000000} step={100000} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#B15A3C] cursor-pointer h-1 rounded-full" />
                  <div className="flex justify-between text-[10px] text-[#443E3B] font-mono mt-1">
                    <span>500K</span><span>5M TND</span>
                  </div>
                </div>
                {/* Favorites */}
                <div className="flex flex-col justify-center">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#B15A3C] block mb-2">
                    Mes Sélections
                  </label>
                  <button onClick={() => setShowSavedOnly(v => !v)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xs border transition-all ${
                      showSavedOnly
                        ? 'bg-[#B15A3C] border-[#B15A3C] text-white'
                        : 'bg-[#FAF8F3] border-[rgba(26,22,21,0.14)] text-[#1A1615] hover:border-[#B15A3C]'
                    }`}>
                    <Heart className={`w-4 h-4 ${showSavedOnly ? 'fill-current' : ''}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {showSavedOnly ? 'Favoris uniquement' : 'Voir mes favoris'}
                    </span>
                  </button>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <button onClick={resetAll}
                  className="flex items-center gap-2 text-[11px] font-mono text-[#443E3B] hover:text-[#B15A3C] uppercase tracking-wider transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Réinitialiser tous les filtres
                </button>
              )}
            </div>
          )}

        </div>

        {/* ── Active Filters Summary ── */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-[#443E3B] uppercase tracking-wider">Filtres actifs :</span>
            {categoryFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 bg-[#B15A3C]/10 border border-[#B15A3C]/30 text-[#B15A3C] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                {categoryFilter}
                <button onClick={() => setCategoryFilter('ALL')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {universeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 bg-[#1A1615]/10 border border-[#1A1615]/20 text-[#1A1615] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                {universeFilter}
                <button onClick={() => setUniverseFilter('ALL')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchCity && (
              <span className="inline-flex items-center gap-1.5 bg-[#1A1615]/10 border border-[#1A1615]/20 text-[#1A1615] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                📍 {searchCity}
                <button onClick={() => setSearchCity('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {minSurface > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-[#1A1615]/10 border border-[#1A1615]/20 text-[#1A1615] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                ≥ {minSurface}m²
                <button onClick={() => setMinSurface(0)}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* ── Results Counter ── */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-xs text-[#443E3B] font-mono">
            <span className="text-[#B15A3C] font-bold">{filteredAndSorted.length}</span> propriété{filteredAndSorted.length !== 1 ? 's' : ''} trouvée{filteredAndSorted.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── Property Grid / List ── */}
        {loadingProperties && propertiesList.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="rounded-xs overflow-hidden bg-[#EFE8D8] border border-[rgba(26,22,21,0.14)] p-4 space-y-4 animate-pulse">
                <div className="w-full h-56 bg-[rgba(26,22,21,0.1)] rounded-xs" />
                <div className="h-4 bg-[rgba(26,22,21,0.1)] rounded w-1/3" />
                <div className="h-6 bg-[rgba(26,22,21,0.1)] rounded w-3/4" />
                <div className="h-4 bg-[rgba(26,22,21,0.1)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="rounded-xs p-16 text-center space-y-4 bg-[#EFE8D8] border border-[rgba(26,22,21,0.14)]">
            <p className="font-serif text-2xl text-[#1A1615]">{t('catalog.empty_title')}</p>
            <p className="text-xs text-[#443E3B]">{t('catalog.empty_desc')}</p>
            <button onClick={resetAll}
              className="mt-2 bg-[#B15A3C] text-[#FAF8F3] px-6 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-widest hover:bg-[#97492e] transition-all">
              {t('btn.reset')}
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-5'}>
            {filteredAndSorted.map((prop) => {
              const CatIcon = CATEGORIES.find(c => c.value === prop.category)?.icon || Home;
              return (
                <div key={prop.id}
                  className={`group rounded-xs overflow-hidden bg-[#FAF8F3] border border-[rgba(26,22,21,0.14)] hover:border-[#B8912E]/50 hover:shadow-xl transition-all duration-300 flex ${
                    viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row'
                  }`}>

                  {/* Image */}
                  <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'w-full h-60' : 'sm:w-72 h-56 shrink-0'}`}>
                    <Image
                      src={prop.images[0].url}
                      alt={prop.title[language]}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="bg-[#B15A3C] text-white font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-xs shadow-xs">
                        {prop.universe}
                      </span>
                    </div>

                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFavorite(prop.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                        isFavorite(prop.id)
                          ? 'bg-[#B15A3C] text-white shadow-md'
                          : 'bg-[#1A1615]/60 text-white hover:text-[#B8912E]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(prop.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#B8912E] font-medium uppercase mb-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{prop.location.district}, {prop.location.city}</span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-[#1A1615] group-hover:text-[#B15A3C] transition-colors leading-tight">
                        {prop.title[language]}
                      </h3>
                      <p className="text-xs text-[#443E3B] font-normal mt-1.5 line-clamp-2 leading-relaxed">
                        {prop.description[language]}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Specs row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#443E3B]">
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-[#B8912E]" />
                          {prop.specs.surfaceM2} m²
                        </span>
                        {prop.specs.bedrooms && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-[#B8912E]" />
                            {prop.specs.bedrooms} ch.
                          </span>
                        )}
                        {prop.specs.pool && (
                          <span className="flex items-center gap-1">
                            <Waves className="w-3.5 h-3.5 text-[#B8912E]" />
                            Piscine
                          </span>
                        )}
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-[rgba(26,22,21,0.1)]">
                        <div>
                          <span className="font-serif text-xl font-semibold text-[#1A1615]">
                            {prop.price.amount.toLocaleString('fr-TN')} TND
                          </span>
                          {prop.price.period && prop.price.period !== 'total' && (
                            <span className="text-[10px] text-[#443E3B] block font-mono uppercase">/ {prop.price.period}</span>
                          )}
                        </div>
                        <Link href={`/properties/${prop.id}`}
                          className="bg-[#B15A3C] text-[#FAF8F3] hover:bg-[#97492e] py-2 px-4 rounded-xs text-xs font-medium uppercase tracking-wider transition-all shadow-xs">
                          {t('btn.discover')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );

}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="pt-32 flex items-center justify-center min-h-screen bg-brand-navy">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-brand-gold/60 uppercase tracking-widest">Chargement du catalogue...</p>
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
