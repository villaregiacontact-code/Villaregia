'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.universes': 'Les Quatre Univers',
    'nav.sale': 'Vente',
    'nav.residence': 'Résidence',
    'nav.luxe': 'Villas de Luxe',
    'nav.event': 'Événementiel',
    'nav.journal': 'Le Journal',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.submit_property': 'Proposer un bien',
    'nav.admin': 'Espace Admin',

    // Hero
    'hero.badge': 'SFAX · TUNISIE',
    'hero.headline': 'Des lieux qui méritent d’être vécus.',
    'hero.subhead': 'Nous sélectionnons des biens d’exception qui ont une histoire, un caractère et une valeur.',
    'hero.cta_explore': 'Explorations des Lieux',
    'hero.cta_propose': 'Proposer un Patrimoine',

    // Four Worlds
    'worlds.title': 'LES QUATRE UNIVERS VILLA REGIA',
    'worlds.subtitle': 'Quatre approches exclusives de l’immobilier d’exception et du séjour de prestige.',
    'worlds.vente.title': 'VENTE',
    'worlds.vente.desc': 'Investir dans un patrimoine d’exception.',
    'worlds.residence.title': 'RÉSIDENCE',
    'worlds.residence.desc': 'Une adresse pensée pour votre quotidien.',
    'worlds.luxe.title': 'VILLAS DE LUXE',
    'worlds.luxe.desc': 'Quelques jours dans un lieu hors du commun.',
    'worlds.event.title': 'ÉVÉNEMENTIEL',
    'worlds.event.desc': 'Des espaces pour vos moments les plus importants.',

    // Discovery Bar
    'search.title': 'Je recherche...',
    'search.all_universes': 'Tous les Univers',
    'search.all_types': 'Tous les types',
    'search.city_placeholder': 'Ville ou zone (ex: Soukra, Thyna...)',
    'search.button': 'Voir les propriétés',

    // Buttons & Labels
    'btn.discover': 'Découvrir la propriété',
    'btn.book': 'Vérifier la disponibilité',
    'btn.quote': 'Demander un devis',
    'btn.whatsapp': 'Discuter sur WhatsApp',
    'btn.favorites': 'Favoris',
    'btn.filter': 'Filtres',
    'btn.back': 'Retour',

    // Footer
    'footer.positioning': 'Villa Regia est la maison de sélection immobilière et d’hospitalité d’exception à Sfax et en Tunisie.',
    'footer.rights': 'Tous droits réservés.',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.universes': 'العوالم الأربعة',
    'nav.sale': 'بيع',
    'nav.residence': 'إقامة دائمية',
    'nav.luxe': 'فيلات فاخرة',
    'nav.event': 'المناسبات',
    'nav.journal': 'المجلة',
    'nav.about': 'عن فيلا ريجيا',
    'nav.contact': 'اتصل بنا',
    'nav.submit_property': 'عرض عقار',
    'nav.admin': 'لوحة التحكم',

    // Hero
    'hero.badge': 'صفاقس · تونس',
    'hero.headline': 'أماكن تستحق أن تُعاش.',
    'hero.subhead': 'نحن نختار عقارات استثنائية ذات تاريخ، شخصية وقيمة استثمارية رفيعة.',
    'hero.cta_explore': 'استكشاف العقارات',
    'hero.cta_propose': 'تقديم عقار',

    // Four Worlds
    'worlds.title': 'عوالم فيلا ريجيا الأربعة',
    'worlds.subtitle': 'أربعة نهج حصرية للعقارات الفاخرة والإقامة المتميزة.',
    'worlds.vente.title': 'بيع',
    'worlds.vente.desc': 'الاستثمار في تراث عقاري استثنائي.',
    'worlds.residence.title': 'إقامة دائمية',
    'worlds.residence.desc': 'عنوان مصمم لحياتك اليومية.',
    'worlds.luxe.title': 'فيلات فاخرة',
    'worlds.luxe.desc': 'أيام معدودة في مكان خارق للعادة.',
    'worlds.event.title': 'المناسبات',
    'worlds.event.desc': 'مساحات مخصصة لأهم لحظات حياتك.',

    // Discovery Bar
    'search.title': 'أنا أبحث عن...',
    'search.all_universes': 'جميع العوالم',
    'search.all_types': 'جميع الأنواع',
    'search.city_placeholder': 'المدينة أو المنطقة (مثال: السكرة، طينة...)',
    'search.button': 'عرض العقارات',

    // Buttons & Labels
    'btn.discover': 'اكتشف العقار',
    'btn.book': 'التحقق من التوفر',
    'btn.quote': 'طلب طلب أسعار',
    'btn.whatsapp': 'التواصل عبر واتساب',
    'btn.favorites': 'المفضلة',
    'btn.filter': 'تصفية',
    'btn.back': 'عودة',

    // Footer
    'footer.positioning': 'فيلا ريجيا هي دار الاختيار العقاري والضيافة الاستثنائية بصفاقس وتونس.',
    'footer.rights': 'جميع الحقوق محفوظة.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.universes': 'The Four Universes',
    'nav.sale': 'For Sale',
    'nav.residence': 'Residence',
    'nav.luxe': 'Luxury Villas',
    'nav.event': 'Events',
    'nav.journal': 'Journal',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.submit_property': 'Submit a Property',
    'nav.admin': 'Admin Dashboard',

    // Hero
    'hero.badge': 'SFAX · TUNISIA',
    'hero.headline': 'Places meant to be truly lived.',
    'hero.subhead': 'We curate exceptional properties with heritage, character, and lasting value.',
    'hero.cta_explore': 'Explore Properties',
    'hero.cta_propose': 'Submit Estate',

    // Four Worlds
    'worlds.title': 'THE FOUR VILLA REGIA UNIVERSES',
    'worlds.subtitle': 'Four exclusive approaches to luxury real estate and premier hospitality.',
    'worlds.vente.title': 'FOR SALE',
    'worlds.vente.desc': 'Invest in an exceptional architectural heritage.',
    'worlds.residence.title': 'RESIDENCE',
    'worlds.residence.desc': 'An address designed for your daily life.',
    'worlds.luxe.title': 'LUXURY VILLAS',
    'worlds.luxe.desc': 'Unforgettable days in an extraordinary sanctuary.',
    'worlds.event.title': 'EVENTS',
    'worlds.event.desc': 'Spaces created for your most significant moments.',

    // Discovery Bar
    'search.title': 'I am looking for...',
    'search.all_universes': 'All Universes',
    'search.all_types': 'All Property Types',
    'search.city_placeholder': 'City or area (e.g. Soukra, Thyna...)',
    'search.button': 'Search Properties',

    // Buttons & Labels
    'btn.discover': 'Explore Property',
    'btn.book': 'Check Availability',
    'btn.quote': 'Request Event Quote',
    'btn.whatsapp': 'Chat on WhatsApp',
    'btn.favorites': 'Saved',
    'btn.filter': 'Filter',
    'btn.back': 'Back',

    // Footer
    'footer.positioning': 'Villa Regia is the curated luxury real estate and hospitality house based in Sfax, Tunisia.',
    'footer.rights': 'All rights reserved.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('vr_lang') as Language;
    if (saved && (saved === 'fr' || saved === 'ar' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vr_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['fr']?.[key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
