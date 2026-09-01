'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoritesContext';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { Property, UniverseType, PropertyCategory } from '@/types';
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
} from 'lucide-react';

// ─── Category definitions ──────────────────────────────────────────────────
const CATEGORIES: { value: PropertyCategory | 'ALL'; label: string; icon: React.ElementType; count?: number }[] = [
  { value: 'ALL', label: 'Tout le Catalogue', icon: Sparkles },
  { value: 'Villa', label: 'Villas', icon: Home },
  { value: 'Appartement', label: 'Appartements', icon: Building2 },
  { value: 'Duplex', label: 'Duplex', icon: Layers },
  { value: 'Penthouse', label: 'Penthouses', icon: Crown },
  { value: 'Domaine Événementiel', label: 'Domaines', icon: CalendarCheck },
];

const UNIVERSES: { value: UniverseType | 'ALL'; label: string; color: string }[] = [
  { value: 'ALL', label: 'Tous', color: 'bg-white/10 text-white/70' },
  { value: 'VENTE', label: 'Vente', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'RESIDENCE', label: 'Résidence', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  { value: 'LUXE', label: 'Séjour Luxe', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { value: 'EVENT', label: 'Événementiel', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
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
  ALL: 'from-brand-gold/30 to-brand-gold/10 border-brand-gold/50 text-brand-gold',
  Villa: 'from-amber-500/25 to-amber-600/10 border-amber-500/40 text-amber-300',
  Appartement: 'from-sky-500/25 to-sky-600/10 border-sky-500/40 text-sky-300',
  Duplex: 'from-violet-500/25 to-violet-600/10 border-violet-500/40 text-violet-300',
  Penthouse: 'from-rose-500/25 to-rose-600/10 border-rose-500/40 text-rose-300',
  'Domaine Événementiel': 'from-emerald-500/25 to-emerald-600/10 border-emerald-500/40 text-emerald-300',
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
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);

  React.useEffect(() => {
    async function fetchLiveProperties() {
      try {
        setLoadingProperties(true);
        const res = await fetch('/api/properties');
        const data = await res.json();
        if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
          setPropertiesList(data.properties);
        }
      } catch (err) {
        console.warn('API fetch properties fallback:', err);
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
    <div className="pt-24 pb-24 bg-brand-navy min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] uppercase text-brand-gold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catalogue Privé Villa Regia</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-white">
            Exploration des Lieux
          </h1>
          <p className="text-sm text-white/40 mt-3 max-w-xl mx-auto font-light">
            Villas, duplex, penthouses et domaines d'exception à Sfax et en Tunisie.
          </p>
        </div>

        {/* ── FILTER PANEL ── */}
        <div className="mb-8 space-y-4">

          {/* ── Category Chips (Main Type Filter) ── */}
          <div className="overflow-x-auto pb-1">
            <div className="flex gap-3 min-w-max sm:flex-wrap sm:min-w-0">
              {CATEGORIES.map(({ value, label, icon: Icon }) => {
                const isActive = categoryFilter === value;
                const count = catCounts[value] || 0;
                return (
                  <button
                    key={value}
                    onClick={() => setCategoryFilter(value as PropertyCategory | 'ALL')}
                    className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-xl border transition-all duration-200 shrink-0 ${
                      isActive
                        ? `bg-gradient-to-r ${CAT_ACTIVE[value]} shadow-lg`
                        : 'bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? '' : 'group-hover:text-white/70'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                    {value !== 'ALL' && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/20' : 'bg-white/10'}`}>
                        {count}
                      </span>
                    )}
                    {isActive && value !== 'ALL' && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-gold rounded-full border-2 border-brand-navy" />
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
              {UNIVERSES.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setUniverseFilter(value as UniverseType | 'ALL')}
                  className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-all ${
                    universeFilter === value
                      ? `${color} border-current shadow`
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Search city */}
            <div className="relative w-full sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
                placeholder="Quartier, secteur…"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-brand-gold/40 transition-all"
              />
              {searchCity && (
                <button onClick={() => setSearchCity('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-9 py-2 text-xs text-white/70 focus:outline-none focus:border-brand-gold/40 transition-all cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            </div>

            {/* Advanced filters toggle */}
            <button onClick={() => setShowAdvanced(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                showAdvanced || activeFiltersCount > 0
                  ? 'bg-brand-gold/15 border-brand-gold/40 text-brand-gold'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
              }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="bg-brand-gold text-brand-navy text-[10px] font-mono px-1.5 py-0.5 rounded-full leading-none">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} title="Grille"
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-gold text-brand-navy shadow' : 'text-white/40 hover:text-white/70'}`}>
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('list')} title="Liste"
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-gold text-brand-navy shadow' : 'text-white/40 hover:text-white/70'}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Advanced Filters Drawer ── */}
          {showAdvanced && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Surface slider */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-gold block mb-2">
                    Surface minimum — {minSurface} m²
                  </label>
                  <input type="range" min={0} max={1000} step={50} value={minSurface}
                    onChange={e => setMinSurface(Number(e.target.value))}
                    className="w-full accent-brand-gold cursor-pointer h-1 rounded-full" />
                  <div className="flex justify-between text-[10px] text-white/30 font-mono mt-1">
                    <span>0 m²</span><span>1000 m²</span>
                  </div>
                </div>
                {/* Price slider */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-gold block mb-2">
                    Prix maximum — {maxPrice.toLocaleString('fr-TN')} TND
                  </label>
                  <input type="range" min={500000} max={5000000} step={100000} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-brand-gold cursor-pointer h-1 rounded-full" />
                  <div className="flex justify-between text-[10px] text-white/30 font-mono mt-1">
                    <span>500K</span><span>5M TND</span>
                  </div>
                </div>
                {/* Favorites */}
                <div className="flex flex-col justify-center">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-gold block mb-2">
                    Mes Sélections
                  </label>
                  <button onClick={() => setShowSavedOnly(v => !v)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      showSavedOnly
                        ? 'bg-brand-gold/15 border-brand-gold/50 text-brand-gold'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                    }`}>
                    <Heart className={`w-4 h-4 ${showSavedOnly ? 'fill-current' : ''}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {showSavedOnly ? 'Favoris uniquement' : 'Voir mes favoris'}
                    </span>
                  </button>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <button onClick={resetAll}
                  className="flex items-center gap-2 text-[11px] font-mono text-white/40 hover:text-brand-gold uppercase tracking-wider transition-colors">
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
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Filtres actifs :</span>
            {categoryFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-[11px] font-mono px-2.5 py-1 rounded-full">
                {categoryFilter}
                <button onClick={() => setCategoryFilter('ALL')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {universeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/70 text-[11px] font-mono px-2.5 py-1 rounded-full">
                {universeFilter}
                <button onClick={() => setUniverseFilter('ALL')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchCity && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/70 text-[11px] font-mono px-2.5 py-1 rounded-full">
                📍 {searchCity}
                <button onClick={() => setSearchCity('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {minSurface > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/70 text-[11px] font-mono px-2.5 py-1 rounded-full">
                ≥ {minSurface}m²
                <button onClick={() => setMinSurface(0)}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* ── Results Counter ── */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-xs text-white/40 font-mono">
            <span className="text-brand-gold font-bold">{filteredAndSorted.length}</span> propriété{filteredAndSorted.length !== 1 ? 's' : ''} trouvée{filteredAndSorted.length !== 1 ? 's' : ''}
          </p>
          {categoryFilter !== 'ALL' && (
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${CAT_ACTIVE[categoryFilter]} border`}>
              {categoryFilter}s
            </span>
          )}
        </div>

        {/* ── Property Grid / List ── */}
        {filteredAndSorted.length === 0 ? (
          <div className="rounded-2xl p-16 text-center space-y-4 bg-white/3 border border-white/8">
            <p className="font-editorial text-2xl text-white/60">Aucun bien ne correspond à ces critères.</p>
            <p className="text-xs text-white/30">Modifiez vos filtres ou réinitialisez la recherche.</p>
            <button onClick={resetAll}
              className="mt-2 bg-brand-gold text-brand-navy px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-all">
              Réinitialiser
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
                  className={`group rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-brand-gold/40 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-300 flex ${
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
                      <span className="bg-brand-gold text-brand-navy font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg shadow">
                        {prop.universe}
                      </span>
                      {prop.isNew && (
                        <span className="bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg shadow">
                          Nouveau
                        </span>
                      )}
                    </div>

                    {/* Category icon badge */}
                    <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-lg`}>
                      <CatIcon className="w-3 h-3 text-brand-gold" />
                      <span className="text-[10px] font-mono text-white/80">{prop.category}</span>
                    </div>

                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFavorite(prop.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                        isFavorite(prop.id)
                          ? 'bg-brand-gold text-brand-navy shadow-lg'
                          : 'bg-black/40 text-white/70 hover:text-brand-gold hover:bg-black/60'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(prop.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-brand-gold font-mono uppercase mb-1.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{prop.location.district}, {prop.location.city}</span>
                      </div>
                      <h3 className="font-editorial text-xl sm:text-2xl font-light text-white group-hover:text-brand-gold transition-colors leading-tight">
                        {prop.title[language]}
                      </h3>
                      <p className="text-xs text-white/40 font-light mt-1.5 line-clamp-2 leading-relaxed">
                        {prop.description[language]}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Specs row */}
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-brand-gold/60" />
                          {prop.specs.surfaceM2} m²
                        </span>
                        {prop.specs.bedrooms && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-brand-gold/60" />
                            {prop.specs.bedrooms} ch.
                          </span>
                        )}
                        {prop.specs.pool && (
                          <span className="flex items-center gap-1">
                            <Waves className="w-3.5 h-3.5 text-brand-gold/60" />
                            Piscine
                          </span>
                        )}
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/8">
                        <div>
                          <span className="font-editorial text-xl font-normal text-brand-gold">
                            {prop.price.amount.toLocaleString('fr-TN')} TND
                          </span>
                          {prop.price.period && prop.price.period !== 'total' && (
                            <span className="text-[10px] text-white/30 block font-mono uppercase">/ {prop.price.period}</span>
                          )}
                        </div>
                        <Link href={`/properties/${prop.id}`}
                          className="bg-brand-gold/15 hover:bg-brand-gold hover:text-brand-navy text-brand-gold py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border border-brand-gold/30 transition-all duration-200">
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
