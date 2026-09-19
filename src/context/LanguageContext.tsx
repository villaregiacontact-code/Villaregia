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
    'hero.badge_sfax': 'Maison fondée à Sfax — Tunisie',
    'hero.headline': 'Des lieux qui méritent d’être vécus.',
    'hero.title': 'Chaque bien a sa propre histoire à vivre.',
    'hero.subhead': 'Nous sélectionnons des biens d’exception qui ont une histoire, un caractère et une valeur.',
    'hero.description': 'Villa Regia accompagne la vente et la location de biens d\'exception : villas, terrains, appartements — et des expériences uniques, du séjour de luxe à la réception de rêve.',
    'hero.cta_explore': 'Explorations des Lieux',
    'hero.cta_propose': 'Proposer un Patrimoine',
    'hero.btn_sale': 'Voir les biens à vendre',
    'hero.btn_book': 'Réserver une villa',
    'hero.stat1_label': 'biens gérés',
    'hero.stat2_label': 'gouvernorats couverts',
    'hero.stat3_label': 'métiers, une seule agence',

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

    // Discovery Bar & Catalog
    'search.title': 'Je recherche...',
    'search.all_universes': 'Tous les Univers',
    'search.all_types': 'Tous les types',
    'search.city_placeholder': 'Ville ou zone (ex: Soukra, Thyna...)',
    'search.button': 'Voir les propriétés',
    'catalog.title': 'Exploration des Lieux',
    'catalog.subtitle': 'Villas, duplex, penthouses et domaines d\'exception à Sfax et en Tunisie.',
    'catalog.badge': 'Catalogue Privé Villa Regia',
    'catalog.filter_all': 'Tout le Catalogue',
    'catalog.filter_villas': 'Villas',
    'catalog.filter_apartments': 'Appartements',
    'catalog.filter_duplex': 'Duplex',
    'catalog.filter_penthouse': 'Penthouses',
    'catalog.filter_domains': 'Domaines',
    'catalog.filter_land': 'Terrains',
    'catalog.found': 'propriété(s) trouvée(s)',
    'catalog.empty_title': 'Aucun bien ne correspond à ces critères.',
    'catalog.empty_desc': 'Modifiez vos filtres ou réinitialisez la recherche.',

    // Property Detail Page
    'detail.gallery': 'Galerie Privée',
    'detail.fullscreen': 'Plein Écran',
    'detail.specs_surface': 'Surface',
    'detail.specs_bedrooms': 'Chambres',
    'detail.specs_bathrooms': 'Salles d\'eau',
    'detail.specs_parking': 'Stationnements',
    'detail.architecture_title': 'L\'Architecture & L\'Esprit du Lieu',
    'detail.story_title': 'Le Récit Villa Regia',
    'detail.amenities_title': 'Prestations & Équipements Exclusifs',
    'detail.inquiry_card_title': 'Intéressé par ce Bien ?',
    'detail.inquiry_card_sub': 'Conseil Privé & Visite',
    'detail.whatsapp_btn': 'WhatsApp Business Officiel',
    'detail.form_btn': 'Formulaire de Demande',
    'detail.guarantee': 'Transaction sécurisée & accompagnement juridique Villa Regia',

    // Luxury Villas Page
    'luxe.page_title': 'Villas de Luxe & Conciergerie Privée',
    'luxe.badge': 'Univers Hospitality & Court Séjour',
    'luxe.subhead': 'Passez quelques jours dans un lieu hors du commun. Profitez d’un service d’hospitalité haut de gamme, d’un chef cuisinier sur demande et de piscines à débordement privées à Sfax.',
    'luxe.choose_villa': 'Choisissez votre Demeure',
    'luxe.booking_engine': 'Moteur de Réservation En Ligne',
    'luxe.checkin': 'Check-in',
    'luxe.checkout': 'Check-out',
    'luxe.guests': 'Nombre d’invités',
    'luxe.total_stay': 'Total du Séjour',
    'luxe.deposit': 'Acompte de confirmation (30%)',
    'luxe.continue_btn': 'Calculer & Continuer la Réservation',
    'luxe.per_night': 'TND / nuit',

    // Events Page
    'events.page_title': 'Des lieux pour créer des souvenirs.',
    'events.badge': 'Univers Événementiel & Mariages',
    'events.subhead': 'Organisez vos mariages d’exception, soirées de gala, séminaires de prestige et shootings photo dans nos domaines privés à Sfax.',
    'events.included_services': 'Prestations Incluses',
    'events.form_title': 'Demande d’Événement Privé',
    'events.event_type': 'Type d’événement',
    'events.wedding': 'Mariage & Réception',
    'events.party': 'Soirée Privée / Anniversaire',
    'events.seminar': 'Séminaire d\'Entreprise / Gala',
    'events.shooting': 'Shooting Photo & Média',
    'events.submit_quote': 'Envoyer la demande de devis',

    // Submit Property Page (Proposer un bien)
    'submit.page_title': 'Proposer votre bien immobilier à Villa Regia',
    'submit.badge': 'Service Propriétaires Prestige & Discrétion',
    'submit.subhead': 'Vous souhaitez vendre ou louer une villa, un terrain, un appartement ou un espace commercial à Sfax ou en Tunisie ? Contactez directement nos conseillers privés par téléphone ou WhatsApp.',
    'submit.whatsapp_title': 'Discuter sur WhatsApp',
    'submit.whatsapp_desc': 'Envoyez les photos, détails ou localisation de votre bien directement à notre équipe de conciergerie privée.',
    'submit.whatsapp_btn': 'Ouvrir WhatsApp DM (+216 27 745 403)',
    'submit.call_title': 'Appeler un Conseiller',
    'submit.call_desc': 'Échangez immédiatement de vive voix avec un expert immobilier Villa Regia pour l\'estimation de votre bien.',
    'submit.call_btn': 'Appeler le +216 27 745 403',
    'submit.discretion_title': 'Engagement de Discrétion & Sécurité Juridique',

    // About Page
    'about.page_title': 'Plus qu’une adresse, une manière de vivre.',
    'about.badge': 'Maison de Sélection Immobilière',
    'about.subhead': 'Fondée à Sfax, Villa Regia est née de la conviction que l’immobilier de prestige et l’hospitalité d’exception reposent sur un curatage rigoureux, une discrétion absolue et un profond respect du patrimoine méditerranéen.',
    'about.anchor_title': 'Notre Ancrage à Sfax & Notre Vision',
    'about.contact_us': 'Nous Contacter',

    // Contact Page
    'contact.page_title': 'Parler à Villa Regia',
    'contact.badge': 'Contact & Conseil Privé',
    'contact.subhead': 'Notre équipe de conseillers privés est à votre entière disposition pour répondre à vos projets d’acquisition, de location ou de mise en valeur patrimoniale.',
    'contact.headquarters': 'Siège Principal — Sfax',
    'contact.address_label': 'Adresse:',
    'contact.address_val': 'Route Manzel Chaker Km 1.5, 3000 Sfax, Tunisie',
    'contact.phone_label': 'Téléphone Privé:',
    'contact.email_label': 'Email:',
    'contact.social_label': 'Réseaux Officiels',
    'contact.form_title': 'Formulaire de Contact',
    'contact.name_field': 'Nom & Prénom',
    'contact.phone_field': 'Téléphone',
    'contact.email_field': 'Email',
    'contact.subject_field': 'Sujet de votre demande',
    'contact.message_field': 'Votre message',
    'contact.send_btn': 'Envoyer mon message',

    // Buttons & Labels
    'btn.discover': 'Découvrir la propriété',
    'btn.book': 'Vérifier la disponibilité',
    'btn.quote': 'Demander un devis',
    'btn.whatsapp': 'Discuter sur WhatsApp',
    'btn.favorites': 'Favoris',
    'btn.filter': 'Filtres',
    'btn.back': 'Retour',
    'btn.reset': 'Réinitialiser',

    // Footer
    'footer.tagline': 'Agence immobilière basée à Sfax, active dans toute la Tunisie.',
    'footer.location': 'Route Manzel Chaker Km 1.5, Sfax',
    'footer.positioning': 'Villa Regia est la maison de sélection immobilière et d’hospitalité d’exception à Sfax et en Tunisie.',
    'footer.rights': 'Tous droits réservés.',
    'footer.sale': 'Vente',
    'footer.rent': 'Location',
    'footer.agency': 'Agence',
    'footer.villas': 'Villas',
    'footer.land': 'Terrains',
    'footer.farmland': 'Terrains agricoles',
    'footer.apartments': 'Appartements & duplex',
    'footer.residence_long': 'Résidence mensuelle/annuelle',
    'footer.luxe_villas': 'Villas de luxe',
    'footer.event_spaces': 'Espaces événementiels',
    'footer.blog_advice': 'Blog & conseils',
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
    'hero.badge_sfax': 'دار أسست في صفاقس — تونس',
    'hero.headline': 'أماكن تستحق أن تُعاش.',
    'hero.title': 'كل عقار له قصته الخاصة لتُعاش.',
    'hero.subhead': 'نحن نختار عقارات استثنائية ذات تاريخ، شخصية وقيمة استثمارية رفيعة.',
    'hero.description': 'ترافق فيلا ريجيا بيع وكراء العقارات الاستثنائية: فيلات، أراضي، شقق — وتجارب فريدة من الإقامة الفاخرة إلى الاستقبالات الحالمة.',
    'hero.cta_explore': 'استكشاف العقارات',
    'hero.cta_propose': 'تقديم عقار',
    'hero.btn_sale': 'عرض العقارات للبيع',
    'hero.btn_book': 'حجز فيلا فاخرة',
    'hero.stat1_label': 'عقار متاح',
    'hero.stat2_label': 'ولاية مغطاة',
    'hero.stat3_label': 'اختصاصات، وكالة واحدة',

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

    // Discovery Bar & Catalog
    'search.title': 'أنا أبحث عن...',
    'search.all_universes': 'جميع العوالم',
    'search.all_types': 'جميع الأنواع',
    'search.city_placeholder': 'المدينة أو المنطقة (مثال: السكرة، طينة...)',
    'search.button': 'عرض العقارات',
    'catalog.title': 'استكشاف العقارات',
    'catalog.subtitle': 'فيلات، دوبلكس، بنتهاوس وأملاك استثنائية بصفاقس وتونس.',
    'catalog.badge': 'كتالوج فيلا ريجيا الخاص',
    'catalog.filter_all': 'كامل الكتالوج',
    'catalog.filter_villas': 'فيلات',
    'catalog.filter_apartments': 'شقق',
    'catalog.filter_duplex': 'دوبلكس',
    'catalog.filter_penthouse': 'بنتهاوس',
    'catalog.filter_domains': 'مساحات ومقرات',
    'catalog.filter_land': 'أراضي',
    'catalog.found': 'عقار تم العثور عليه',
    'catalog.empty_title': 'لا يوجد عقار يطابق هذه المعايير.',
    'catalog.empty_desc': 'قم بتغيير خيارات التصفية أو إعادة الضبط.',

    // Property Detail Page
    'detail.gallery': 'معرض الصور الخاص',
    'detail.fullscreen': 'ملء الشاشة',
    'detail.specs_surface': 'المساحة',
    'detail.specs_bedrooms': 'غرف النوم',
    'detail.specs_bathrooms': 'الحمامات',
    'detail.specs_parking': 'موقف سيارات',
    'detail.architecture_title': 'المعمار وروح المكان',
    'detail.story_title': 'رواية فيلا ريجيا',
    'detail.amenities_title': 'الميزات والخدمات الحصرية',
    'detail.inquiry_card_title': 'هل تود الاستفسار عن هذا العقار؟',
    'detail.inquiry_card_sub': 'استشارة خاصة وزيارة',
    'detail.whatsapp_btn': 'واتساب الأعمال الرسمي',
    'detail.form_btn': 'استمارة الطلب',
    'detail.guarantee': 'معاملة آمنة ومرافقة قانونية من فيلا ريجيا',

    // Luxury Villas Page
    'luxe.page_title': 'فيلات فاخرة وخدمات الضيافة الخاصة',
    'luxe.badge': 'عالم الضيافة والإقامة القصيرة',
    'luxe.subhead': 'اقضِ أياماً في مكان خارق للعادة. استمتع بخدمات ضيافة عالية المستوى، طاهٍ خاص عند الطلب ومسابح خاصة بصفاقس.',
    'luxe.choose_villa': 'اختر إقامتك الفاخرة',
    'luxe.booking_engine': 'محرك الحجز عبر الإنترنت',
    'luxe.checkin': 'تاريخ الوصول',
    'luxe.checkout': 'تاريخ المغادرة',
    'luxe.guests': 'عدد الضيوف',
    'luxe.total_stay': 'مجموع الإقامة',
    'luxe.deposit': 'تأكيد الحجز (30%)',
    'luxe.continue_btn': 'حساب ومتابعة الحجز',
    'luxe.per_night': 'دينار / ليلة',

    // Events Page
    'events.page_title': 'أماكن لصنع أجمل الذكريات.',
    'events.badge': 'عالم المناسبات والأعراس',
    'events.subhead': 'نظم أعراسك الاستثنائية، سهرات الحفلات، الملتقيات الرفيعة وجلسات التصوير في أملاكنا الخاصة بصفاقس.',
    'events.included_services': 'الخدمات المدمجة',
    'events.form_title': 'طلب مناسبة خاصة',
    'events.event_type': 'نوع المناسبة',
    'events.wedding': 'حفل زفاف واستقبال',
    'events.party': 'سهرة خاصة / عيد ميلاد',
    'events.seminar': 'ملتقى شركات / حفل رسمي',
    'events.shooting': 'جلسة تصوير وإعلام',
    'events.submit_quote': 'إرسال طلب الأسعار',

    // Submit Property Page (Proposer un bien)
    'submit.page_title': 'عرض عقارك على فيلا ريجيا',
    'submit.badge': 'خدمة المالكين الفاخرة وبسرية تامة',
    'submit.subhead': 'هل ترغب في بيع أو كراء فيلا، أرض، شقة أو محل تجاري بصفاقس أو تونس؟ تواصل مباشرة مع مستشارينا عبر الهاتف أو واتساب.',
    'submit.whatsapp_title': 'التواصل عبر واتساب',
    'submit.whatsapp_desc': 'أرسل صور وتفاصيل أو موقع عقارك مباشرة إلى فريق الضيافة والاستشارة الخاص بنا.',
    'submit.whatsapp_btn': 'فتح محادثة واتساب (+216 27 745 403)',
    'submit.call_title': 'الاتصال بمستشار',
    'submit.call_desc': 'تحدث فوراً وصوتياً مع خبير عقاري فيلا ريجيا لتقييم عقارك.',
    'submit.call_btn': 'الاتصال على 403 745 27 216+',
    'submit.discretion_title': 'التزام السرية والأمان القانوني',

    // About Page
    'about.page_title': 'أكثر من مجرد عنوان، أسلوب حياة.',
    'about.badge': 'دار الاختيار العقاري',
    'about.subhead': 'أسست في صفاقس، نشأت فيلا ريجيا من قناعة أن العقارات الفاخرة والضيافة المتميزة تعتمد على الانتقاء الدقيق والسرية المطلقة والاحترافية.',
    'about.anchor_title': 'ترسخنا بصفاقس ورؤيتنا',
    'about.contact_us': 'تواصل معنا',

    // Contact Page
    'contact.page_title': 'التواصل مع فيلا ريجيا',
    'contact.badge': 'التواصل والاستشارة الخاصة',
    'contact.subhead': 'فريق المستشارين على كامل الاستعداد للإجابة عن مشاريعكم في الشراء، الكراء أو الاستثمار.',
    'contact.headquarters': 'المقر الرئيسي — صفاقس',
    'contact.address_label': 'العنوان:',
    'contact.address_val': 'طريق منزل شاكر كلم 1.5، 3000 صفاقس، تونس',
    'contact.phone_label': 'الهاتف الخاص:',
    'contact.email_label': 'البريد الإلكتروني:',
    'contact.social_label': 'القنوات الرسمية',
    'contact.form_title': 'استمارة التواصل',
    'contact.name_field': 'الاسم واللقب',
    'contact.phone_field': 'الهاتف',
    'contact.email_field': 'البريد الإلكتروني',
    'contact.subject_field': 'موضوع الطلب',
    'contact.message_field': 'رسالتك',
    'contact.send_btn': 'إرسال الرسالة',

    // Buttons & Labels
    'btn.discover': 'اكتشف العقار',
    'btn.book': 'التحقق من التوفر',
    'btn.quote': 'طلب أسعار',
    'btn.whatsapp': 'التواصل عبر واتساب',
    'btn.favorites': 'المفضلة',
    'btn.filter': 'تصفية',
    'btn.back': 'عودة',
    'btn.reset': 'إعادة ضبط',

    // Footer
    'footer.tagline': 'وكالة عقارية مقرها صفاقس، تنشط في كامل التراب التونسي.',
    'footer.location': 'طريق منزل شاكر كلم 1.5، صفاقس',
    'footer.positioning': 'فيلا ريجيا هي دار الاختيار العقاري والضيافة الاستثنائية بصفاقس وتونس.',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.sale': 'بيع',
    'footer.rent': 'كراء',
    'footer.agency': 'الوكالة',
    'footer.villas': 'فيلات',
    'footer.land': 'أراضي',
    'footer.farmland': 'أراضي فلاحية',
    'footer.apartments': 'شقق ودوبلكس',
    'footer.residence_long': 'إقامة شهرية / سنوية',
    'footer.luxe_villas': 'فيلات فاخرة',
    'footer.event_spaces': 'مساحات للمناسبات',
    'footer.blog_advice': 'المدونة والنصائح',
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
    'hero.badge_sfax': 'Founded in Sfax — Tunisia',
    'hero.headline': 'Places meant to be truly lived.',
    'hero.title': 'Every property has a story waiting to be lived.',
    'hero.subhead': 'We curate exceptional properties with heritage, character, and lasting value.',
    'hero.description': 'Villa Regia guides the sale and rental of premier properties: villas, land, apartments — and unique experiences, from luxury stays to dream event receptions.',
    'hero.cta_explore': 'Explore Properties',
    'hero.cta_propose': 'Submit Estate',
    'hero.btn_sale': 'View Properties for Sale',
    'hero.btn_book': 'Book a Villa',
    'hero.stat1_label': 'curated estates',
    'hero.stat2_label': 'governorates covered',
    'hero.stat3_label': 'disciplines, one agency',

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

    // Discovery Bar & Catalog
    'search.title': 'I am looking for...',
    'search.all_universes': 'All Universes',
    'search.all_types': 'All Property Types',
    'search.city_placeholder': 'City or area (e.g. Soukra, Thyna...)',
    'search.button': 'Search Properties',
    'catalog.title': 'Explore Properties',
    'catalog.subtitle': 'Villas, duplexes, penthouses, and premier estates in Sfax and Tunisia.',
    'catalog.badge': 'Villa Regia Private Catalog',
    'catalog.filter_all': 'Full Catalog',
    'catalog.filter_villas': 'Villas',
    'catalog.filter_apartments': 'Apartments',
    'catalog.filter_duplex': 'Duplexes',
    'catalog.filter_penthouse': 'Penthouses',
    'catalog.filter_domains': 'Estates',
    'catalog.filter_land': 'Land Plots',
    'catalog.found': 'property(ies) found',
    'catalog.empty_title': 'No properties match these criteria.',
    'catalog.empty_desc': 'Adjust your filters or reset search.',

    // Property Detail Page
    'detail.gallery': 'Private Gallery',
    'detail.fullscreen': 'Fullscreen',
    'detail.specs_surface': 'Area',
    'detail.specs_bedrooms': 'Bedrooms',
    'detail.specs_bathrooms': 'Bathrooms',
    'detail.specs_parking': 'Parking',
    'detail.architecture_title': 'Architecture & Spirit of the Place',
    'detail.story_title': 'The Villa Regia Story',
    'detail.amenities_title': 'Exclusive Features & Amenities',
    'detail.inquiry_card_title': 'Interested in this Property?',
    'detail.inquiry_card_sub': 'Private Advisory & Private Viewing',
    'detail.whatsapp_btn': 'Official WhatsApp Business',
    'detail.form_btn': 'Inquiry Form',
    'detail.guarantee': 'Secured transaction & legal support by Villa Regia',

    // Luxury Villas Page
    'luxe.page_title': 'Luxury Villas & Private Concierge',
    'luxe.badge': 'Hospitality & Short Stays',
    'luxe.subhead': 'Spend a few days in an extraordinary sanctuary. Enjoy high-end hospitality, on-demand private chefs, and private infinity pools in Sfax.',
    'luxe.choose_villa': 'Select Your Villa',
    'luxe.booking_engine': 'Online Booking Engine',
    'luxe.checkin': 'Check-in',
    'luxe.checkout': 'Check-out',
    'luxe.guests': 'Guests',
    'luxe.total_stay': 'Total Stay',
    'luxe.deposit': 'Confirmation Deposit (30%)',
    'luxe.continue_btn': 'Calculate & Proceed with Booking',
    'luxe.per_night': 'TND / night',

    // Events Page
    'events.page_title': 'Venues to create lasting memories.',
    'events.badge': 'Events & Weddings Universe',
    'events.subhead': 'Host your dream weddings, gala dinners, corporate retreats, and photoshoots in our private estates in Sfax.',
    'events.included_services': 'Included Features',
    'events.form_title': 'Private Event Inquiry',
    'events.event_type': 'Event Type',
    'events.wedding': 'Wedding & Reception',
    'events.party': 'Private Party / Anniversary',
    'events.seminar': 'Corporate Seminar / Gala',
    'events.shooting': 'Photo & Media Shoot',
    'events.submit_quote': 'Submit Quote Request',

    // Submit Property Page (Proposer un bien)
    'submit.page_title': 'Submit Your Estate to Villa Regia',
    'submit.badge': 'Prestige Owners Service & Discretion',
    'submit.subhead': 'Looking to sell or rent a villa, land plot, apartment, or commercial space in Sfax or Tunisia? Contact our private advisors directly via Phone or WhatsApp.',
    'submit.whatsapp_title': 'Chat on WhatsApp',
    'submit.whatsapp_desc': 'Send photos, details, or location of your property directly to our concierge team.',
    'submit.whatsapp_btn': 'Open WhatsApp DM (+216 27 745 403)',
    'submit.call_title': 'Call an Advisor',
    'submit.call_desc': 'Speak immediately with a Villa Regia real estate expert for a valuation.',
    'submit.call_btn': 'Call +216 27 745 403',
    'submit.discretion_title': 'Discretion Commitment & Legal Security',

    // About Page
    'about.page_title': 'More than an address, a way of living.',
    'about.badge': 'Real Estate Selection House',
    'about.subhead': 'Founded in Sfax, Villa Regia was born from the conviction that luxury real estate and hospitality rest on careful curation, total discretion, and deep respect for Mediterranean heritage.',
    'about.anchor_title': 'Our Sfax Roots & Vision',
    'about.contact_us': 'Contact Us',

    // Contact Page
    'contact.page_title': 'Contact Villa Regia',
    'contact.badge': 'Contact & Private Advisory',
    'contact.subhead': 'Our team of private advisors is at your disposal for acquisition, rental, or estate management projects.',
    'contact.headquarters': 'Main Headquarters — Sfax',
    'contact.address_label': 'Address:',
    'contact.address_val': 'Route Manzel Chaker Km 1.5, 3000 Sfax, Tunisia',
    'contact.phone_label': 'Private Phone:',
    'contact.email_label': 'Email:',
    'contact.social_label': 'Official Social Media',
    'contact.form_title': 'Contact Form',
    'contact.name_field': 'Full Name',
    'contact.phone_field': 'Phone Number',
    'contact.email_field': 'Email Address',
    'contact.subject_field': 'Subject of Request',
    'contact.message_field': 'Your Message',
    'contact.send_btn': 'Send Message',

    // Buttons & Labels
    'btn.discover': 'Explore Property',
    'btn.book': 'Check Availability',
    'btn.quote': 'Request Event Quote',
    'btn.whatsapp': 'Chat on WhatsApp',
    'btn.favorites': 'Saved',
    'btn.filter': 'Filter',
    'btn.back': 'Back',
    'btn.reset': 'Reset',

    // Footer
    'footer.tagline': 'Real estate agency based in Sfax, active throughout Tunisia.',
    'footer.location': 'Route Manzel Chaker Km 1.5, Sfax',
    'footer.positioning': 'Villa Regia is the curated luxury real estate and hospitality house based in Sfax, Tunisia.',
    'footer.rights': 'All rights reserved.',
    'footer.sale': 'For Sale',
    'footer.rent': 'Rentals',
    'footer.agency': 'Agency',
    'footer.villas': 'Villas',
    'footer.land': 'Land Plots',
    'footer.farmland': 'Agricultural Land',
    'footer.apartments': 'Apartments & Duplexes',
    'footer.residence_long': 'Monthly / Annual Residence',
    'footer.luxe_villas': 'Luxury Villas',
    'footer.event_spaces': 'Event Venues',
    'footer.blog_advice': 'Blog & Advice',
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

