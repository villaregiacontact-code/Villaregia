'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { PropertyCategory, UniverseType } from '@/types';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Mail,
  Send,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Trash2,
  Home,
  Building2,
  Layers,
  Crown,
  Waves,
  Trees,
  Car,
  Zap,
  DoorOpen,
  SquareStack,
  Bath,
  ChevronDown,
  ImagePlus,
} from 'lucide-react';

// ─────────────────────────────────────────────
// TYPE-SPECIFIC QUESTION SCHEMAS
// ─────────────────────────────────────────────
const PROPERTY_ICONS: Record<PropertyCategory, React.ElementType> = {
  Villa: Home,
  Appartement: Building2,
  Duplex: Layers,
  Penthouse: Crown,
  Terrain: MapPin,
  'Terrain Agricole': Trees,
  'Domaine Événementiel': Sparkles,
  'Maison de Charme': Home,
};

const PROPERTY_COLORS: Record<PropertyCategory, string> = {
  Villa: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  Appartement: 'from-sky-500/20 to-sky-600/10 border-sky-500/30',
  Duplex: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
  Penthouse: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  Terrain: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  'Terrain Agricole': 'from-green-500/20 to-green-600/10 border-green-500/30',
  'Domaine Événementiel': 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  'Maison de Charme': 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
};

type SpecificDetails = {
  // Villa
  hasPool?: boolean;
  hasGarden?: boolean;
  hasGarage?: boolean;
  gardenM2?: number;
  poolType?: string;
  hasTerrace?: boolean;
  titreType?: string;
  // Appartement
  floor?: number;
  totalFloors?: number;
  hasElevator?: boolean;
  hasBalakon?: boolean;
  residenceType?: string;
  // Duplex
  duplexFloors?: number;
  hasRooftop?: boolean;
  roofM2?: number;
  // Penthouse
  panoramicView?: boolean;
  terraceM2?: number;
  conciergeService?: boolean;
  // Common
  bathrooms?: number;
  yearBuilt?: number;
  parkingSpots?: number;
  isNew?: boolean;
};

const inputCls = 'w-full bg-brand-navy/60 border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/20 transition-all';
const labelCls = 'text-[10px] font-mono font-bold uppercase tracking-wider text-brand-gold block mb-1.5';
const toggleCls = (active: boolean) =>
  `px-4 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer select-none ${
    active
      ? 'bg-brand-gold text-brand-navy border-brand-gold shadow-lg shadow-brand-gold/20'
      : 'bg-brand-navy/50 border-white/10 text-white/60 hover:border-brand-gold/30 hover:text-white/80'
  }`;

// ─────────────────────────────────────────────
// TUNISIA COMPLETE LOCATION DATABASE
// Gouvernorat → Ville → Quartiers / Routes
// ─────────────────────────────────────────────
const TUNISIA_LOCATIONS: Record<string, Record<string, string[]>> = {
  'Sfax': {
    'Sfax Ville': [
      'Route de la Soukra',
      'Route de la Soukra Km 1', 'Route de la Soukra Km 2', 'Route de la Soukra Km 3',
      'Route de la Soukra Km 4', 'Route de la Soukra Km 5', 'Route de la Soukra Km 6',
      'Route de Thyna', 'Route de Thyna Km 1', 'Route de Thyna Km 2', 'Route de Thyna Km 3',
      'Route de Thyna Km 4', 'Route de Thyna Km 5',
      'Route de Tunis', 'Route de Tunis Km 1', 'Route de Tunis Km 2', 'Route de Tunis Km 3',
      'Route de Gremda', 'Route de Gremda Km 1', 'Route de Gremda Km 2',
      'Route de Saltania', 'Route de Téniour', 'Route de Mahres',
      'Route El Ain', 'Route Menzel Chaker',
      'Sfax Médina', 'Sfax Centre', 'Sakiet Ezzit', 'Sakiet Eddaier',
      'El Ain', 'Chihia', 'Hay Riadh', 'Hay Ettahrir', 'Hay El Barid',
      'Manzel Hichem', 'Cité El Habib', 'Cité Ennour', 'Cité Ezzahra',
      'Cité Erriadh', 'Cité El Maamoura', 'El Maamoura',
      'Route de Ghraiba', 'Route de Bir Ali', 'Route de Skhira',
      'Autre quartier de Sfax',
    ],
    'Sakiet Ezzit': [
      'Centre Sakiet Ezzit', 'Cité Ennour', 'Cité El Habib', 'Cité El Barid',
      'Route de Thyna', 'Route de la Soukra', 'Hay Riadh', 'Hay Ettahrir',
    ],
    'Sakiet Eddaier': [
      'Centre Sakiet Eddaier', 'Cité Ettahrir', 'Route de Gremda', 'Route de Tunis',
      'Hay El Amel', 'Cité Ezzahra',
    ],
    'Thyna': [
      'Route de Thyna Km 1', 'Route de Thyna Km 2', 'Route de Thyna Km 3',
      'Route de Thyna Km 4', 'Route de Thyna Km 5', 'Hay El Maamoura',
      'Cité El Habib', 'Centre Thyna',
    ],
    'Gremda': [
      'Route de Gremda Km 1', 'Route de Gremda Km 2', 'Route de Gremda Km 3',
      'Cité Ennour', 'Cité El Habib', 'Centre Gremda',
    ],
    'El Ain': [
      'Route El Ain', 'Cité El Ain', 'Centre El Ain', 'Route de Saltania',
      'Route de Téniour', 'Hay Riadh El Ain',
    ],
    'Agareb': [
      'Centre Agareb', 'Route de Sfax Agareb', 'Hay El Amel', 'Cité Ennour',
    ],
    'Bir Ali Ben Khalifa': [
      'Centre Bir Ali', 'Route de Sfax', 'Hay El Maamoura',
    ],
    'Chihia': [
      'Centre Chihia', 'Route de Sfax Chihia', 'Hay El Amel',
    ],
    'Ghraiba': [
      'Centre Ghraiba', 'Route de Sfax Ghraiba',
    ],
    'Jebéniana': [
      'Centre Jebéniana', 'Route de Sfax Jebéniana', 'Zone Industrielle Jebéniana',
    ],
    'Kerkennah': [
      'Attaya', 'El Abbassia', 'El Chergui', 'El Gharbi',
      'Mellita', 'Ouled Yaneg', 'Kraten',
    ],
    'Mahres': [
      'Centre Mahres', 'Route de Sfax Mahres', 'Zone Côtière Mahres', 'Hay El Amel',
    ],
    'Menzel Chaker': [
      'Centre Menzel Chaker', 'Route de Sfax Menzel Chaker',
    ],
    'Skhira': [
      'Centre Skhira', 'Zone Industrielle Skhira', 'Zone Côtière Skhira',
    ],
    'Téniour': [
      'Route de Téniour Km 1', 'Route de Téniour Km 2', 'Route de Téniour Km 3',
      'Centre Téniour', 'Hay El Amel Téniour',
    ],
  },
  'Tunis': {
    'Tunis Ville': [
      'Médina de Tunis', 'Lafayette', 'El Menzah', 'El Menzah 1', 'El Menzah 4',
      'El Menzah 5', 'El Menzah 6', 'El Menzah 7', 'El Menzah 8', 'El Menzah 9',
      'Ennahli', 'Les Berges du Lac 1', 'Les Berges du Lac 2', 'Lac 1', 'Lac 2',
      'El Khadra', 'Montplaisir', 'Belvédère', 'Mutuelle Ville', 'Bab Bhar',
      'La Marsa', 'Sidi Bou Said', 'Carthage', 'Le Kram',
      'Autre quartier de Tunis',
    ],
    'Ariana': [
      'Ariana Ville', 'Ariana Essoughra', 'Cité Ghazela', 'Cité Ettadhamen',
      'Mnihla', 'Raoued', 'Sidi Thabet', 'El Menzah', 'Borj Louzir',
    ],
    'Ben Arous': [
      'Ben Arous Ville', 'Ezzahra', 'Hammam Lif', 'Hammam Chatt', 'Bou Mhel el-Bassatine',
      'El Mourouj', 'Fouchana', 'Khalidia', 'Medina Jedida', 'Mégrine', 'Mornag', 'Radès',
    ],
    'Manouba': [
      'Manouba Ville', 'Denden', 'Douar Hicher', 'El Battan', 'Jedaida',
      'Mornaguia', 'Oued Ellil', 'Tébourba',
    ],
    'La Marsa': [
      'La Marsa Centre', 'La Marsa Plage', 'Sidi Bou Said', 'Gammarth',
      'Route de la Marsa', 'Cité Soukra La Marsa', 'Ain Zaghouan',
    ],
    'Carthage': [
      'Byrsa', 'Dermech', 'Hannibal', 'Carthage Présidence', 'Carthage Amilcar',
      'Carthage Salammbo', 'Carthage Junon',
    ],
    'Gammarth': [
      'Gammarth Village', 'Gammarth Centre', 'Gammarth Plage',
      'Route de Gammarth', 'Hôtel Zone Gammarth', 'Gammarth Supérieur',
    ],
  },
  'Sousse': {
    'Sousse Ville': [
      'Médina de Sousse', 'Khezama', 'Sahloul', 'Riadh', 'Sidi Abdelhamid',
      'Zaouia', 'Hay Erriadh', 'Cité Boudher', 'Zone Touristique Sousse',
      'Autre quartier de Sousse',
    ],
    'Hammam Sousse': [
      'Centre Hammam Sousse', 'Zone Hôtelière Hammam Sousse',
      'Route Touristique Hammam Sousse', 'Borj Ghorbel',
    ],
    'Kalâa Kebira': [
      'Centre Kalâa Kebira', 'Route de Sousse Kalâa Kebira',
    ],
    'Akouda': [
      'Centre Akouda', 'Zone Touristique Akouda', 'Route Côtière Akouda',
    ],
    'Msaken': [
      'Centre Msaken', 'Route de Sousse Msaken', 'Hay El Amel Msaken',
    ],
    'Kondar': [
      'Centre Kondar', 'Route de Sousse Kondar',
    ],
    'Sidi Bou Ali': [
      'Centre Sidi Bou Ali', 'Route de Sousse Sidi Bou Ali',
    ],
  },
  'Monastir': {
    'Monastir Ville': [
      'Médina de Monastir', 'Skanes', 'Ouardia', 'Hay Ksiba',
      'Zone Touristique Monastir', 'Route de Tunis Monastir',
      'Autre quartier de Monastir',
    ],
    'Skanes': [
      'Skanes Centre', 'Zone Hôtelière Skanes', 'Route Touristique Skanes',
    ],
    'Ksar Hellal': [
      'Centre Ksar Hellal', 'Route de Monastir Ksar Hellal',
    ],
    'Moknine': [
      'Centre Moknine', 'Zone Industrielle Moknine',
    ],
    'Jemmal': [
      'Centre Jemmal', 'Route de Sousse Jemmal',
    ],
  },
  'Mahdia': {
    'Mahdia Ville': [
      'Médina de Mahdia', 'Zone Touristique Mahdia', 'Hiboun', 'Sidi Messaoud',
      'Route Côtière Mahdia', 'Autre quartier de Mahdia',
    ],
    'El Jem': [
      'Centre El Jem', 'Route de Sfax El Jem', 'Route de Mahdia El Jem',
    ],
    'Chebba': [
      'Centre Chebba', 'Zone Portuaire Chebba', 'Route Côtière Chebba',
    ],
    'Ksour Essef': [
      'Centre Ksour Essef', 'Route de Mahdia Ksour Essef',
    ],
  },
  'Nabeul': {
    'Nabeul Ville': [
      'Médina de Nabeul', 'Zone Touristique Nabeul', 'Route de Hammamet',
      'Route de Tunis Nabeul', 'Hay Erriadh Nabeul', 'Autre quartier de Nabeul',
    ],
    'Hammamet': [
      'Hammamet Centre', 'Hammamet Nord', 'Hammamet Sud', 'Yasmine Hammamet',
      'Zone Hôtelière Hammamet', 'Route Touristique Hammamet',
    ],
    'Yasmine Hammamet': [
      'Yasmine Hammamet Centre', 'Zone Résidentielle Yasmine',
      'Zone Hôtelière Yasmine', 'Baie des Anges', 'Medina Yasmina',
    ],
    'Kélibia': [
      'Centre Kélibia', 'Zone Côtière Kélibia', 'Route de Nabeul Kélibia',
    ],
    'Korba': [
      'Centre Korba', 'Zone Touristique Korba', 'Route Côtière Korba',
    ],
    'Menzel Temime': [
      'Centre Menzel Temime', 'Route de Nabeul Menzel Temime',
    ],
  },
  'Djerba — Médenine': {
    'Djerba': [
      'Houmt Souk', 'Midoun', 'Aghir', "Ras R'mel", 'El Kantara',
      'Sedouikech', 'Guellala', 'Mahboubine', 'Zone Hôtelière Djerba',
      'Route Touristique Djerba', 'Autre quartier de Djerba',
    ],
    'Médenine Ville': [
      'Centre Médenine', 'Hay El Amel Médenine', 'Route de Tunis Médenine',
    ],
    'Zarzis': [
      'Centre Zarzis', 'Zone Touristique Zarzis', 'Zone Portuaire Zarzis',
      'Route Côtière Zarzis',
    ],
    'Ben Gardane': [
      'Centre Ben Gardane', 'Zone Frontalière Ben Gardane', 'Route de Tunis Ben Gardane',
    ],
  },
  'Kairouan': {
    'Kairouan Ville': [
      'Médina de Kairouan', 'Hay Erriadh', 'Hay El Amel',
      'Route de Tunis Kairouan', 'Route de Sfax Kairouan',
      'Autre quartier de Kairouan',
    ],
    'Sbikha': [
      'Centre Sbikha', 'Route de Kairouan Sbikha',
    ],
    'Hajeb El Ayoun': [
      'Centre Hajeb El Ayoun', 'Zone Industrielle Hajeb',
    ],
  },
  'Gabès': {
    'Gabès Ville': [
      'Médina de Gabès', 'Jara', 'Menzel', 'Chott', 'Matmata',
      'Route de Sfax Gabès', 'Zone Industrielle Gabès',
      'Autre quartier de Gabès',
    ],
    'Matmata': [
      'Matmata Centre', 'Matmata Nouvelle', 'Route de Gabès Matmata',
    ],
    'El Hamma': [
      'Centre El Hamma', 'Zone Thermale El Hamma',
    ],
  },
  'Bizerte': {
    'Bizerte Ville': [
      'Bizerte Centre', 'Corniche Bizerte', 'Ain Mariem', 'Jaafer', 'Zarzouna',
      'Route de Tunis Bizerte', 'Zone Touristique Bizerte',
      'Autre quartier de Bizerte',
    ],
    'Menzel Bourguiba': [
      'Centre Menzel Bourguiba', 'Route de Bizerte Menzel Bourguiba',
    ],
    'Mateur': [
      'Centre Mateur', 'Route de Bizerte Mateur', 'Zone Agricole Mateur',
    ],
  },
  'Béja': {
    'Béja Ville': [
      'Béja Centre', 'Route de Tunis Béja', 'Route de Jendouba Béja',
      'Zone Agricole Béja', 'Autre quartier de Béja',
    ],
    'Testour': [
      'Centre Testour', 'Route de Béja Testour',
    ],
    'Nefza': [
      'Centre Nefza', 'Route de Béja Nefza',
    ],
  },
  'Jendouba': {
    'Jendouba Ville': [
      'Jendouba Centre', 'Route de Tunis Jendouba', 'Route de Béja Jendouba',
      'Autre quartier de Jendouba',
    ],
    'Tabarka': [
      'Tabarka Centre', 'Zone Touristique Tabarka', 'Zone Côtière Tabarka',
      'Ain Draham',
    ],
    'Ain Draham': [
      'Ain Draham Centre', 'Route de Jendouba Ain Draham', 'Zone Montagnarde Ain Draham',
    ],
  },
  'Le Kef': {
    'Le Kef Ville': [
      'Le Kef Centre', 'Médina du Kef', 'Route de Tunis Le Kef',
      'Hay El Amel Le Kef', 'Autre quartier du Kef',
    ],
    'Dahmani': [
      'Centre Dahmani', 'Route du Kef Dahmani',
    ],
  },
  'Siliana': {
    'Siliana Ville': [
      'Siliana Centre', 'Route de Tunis Siliana', 'Zone Agricole Siliana',
      'Autre quartier de Siliana',
    ],
    'Makthar': [
      'Centre Makthar', 'Zone Archéologique Makthar',
    ],
  },
  'Kasserine': {
    'Kasserine Ville': [
      'Kasserine Centre', 'Route de Tunis Kasserine', 'Zone Industrielle Kasserine',
      'Autre quartier de Kasserine',
    ],
    'Sbeitla': [
      'Centre Sbeitla', 'Zone Archéologique Sbeitla',
    ],
    'Thala': [
      'Centre Thala', 'Route de Kasserine Thala',
    ],
  },
  'Sidi Bouzid': {
    'Sidi Bouzid Ville': [
      'Sidi Bouzid Centre', 'Route de Sfax Sidi Bouzid', 'Zone Agricole Sidi Bouzid',
      'Autre quartier de Sidi Bouzid',
    ],
    'Regueb': [
      'Centre Regueb', 'Route de Sidi Bouzid Regueb',
    ],
    'Menzel Bouzaiane': [
      'Centre Menzel Bouzaiane', 'Zone Minière Menzel Bouzaiane',
    ],
  },
  'Gafsa': {
    'Gafsa Ville': [
      'Gafsa Centre', 'Lala', 'Sidi Ahmed Zarroug', 'Route de Tunis Gafsa',
      'Zone Minière Gafsa', 'Autre quartier de Gafsa',
    ],
    'Métlaoui': [
      'Centre Métlaoui', 'Zone Minière Métlaoui',
    ],
    'Redeyef': [
      'Centre Redeyef', 'Zone Minière Redeyef',
    ],
    'El Ksar': [
      'Centre El Ksar Gafsa', 'Route de Gafsa El Ksar',
    ],
  },
  'Tozeur': {
    'Tozeur Ville': [
      'Tozeur Centre', 'Médina de Tozeur', 'Zone Touristique Tozeur',
      'Route de Gafsa Tozeur', 'Nefta', 'Autre quartier de Tozeur',
    ],
    'Nefta': [
      'Centre Nefta', 'Zone Touristique Nefta', 'Route de Tozeur Nefta',
    ],
  },
  'Kébili': {
    'Kébili Ville': [
      'Kébili Centre', 'Route de Tozeur Kébili', 'Douz', 'Autre quartier de Kébili',
    ],
    'Douz': [
      'Centre Douz', 'Zone Touristique Douz (Porte du Sahara)', 'Route de Kébili Douz',
    ],
  },
  'Tataouine': {
    'Tataouine Ville': [
      'Tataouine Centre', 'Route de Médenine Tataouine', 'Ghomrassen',
      'Beni Barka', 'Autre quartier de Tataouine',
    ],
    'Ghomrassen': [
      'Centre Ghomrassen', 'Route de Tataouine Ghomrassen',
    ],
    'Remada': [
      'Centre Remada', 'Zone Frontalière Remada',
    ],
  },
  'Zaghouan': {
    'Zaghouan Ville': [
      'Zaghouan Centre', 'Route de Tunis Zaghouan', 'Zone Touristique Zaghouan',
      'Autre quartier de Zaghouan',
    ],
    'Nadhour': [
      'Centre Nadhour', 'Route de Zaghouan Nadhour',
    ],
  },
};

// Helper: get gouvernorats
const GOUVERNORATS = Object.keys(TUNISIA_LOCATIONS);

// Helper: get cities for a gouvernorat
const getCities = (gov: string): string[] =>
  gov && TUNISIA_LOCATIONS[gov] ? Object.keys(TUNISIA_LOCATIONS[gov]) : [];

// Helper: get districts for a city within a gouvernorat
const getDistricts = (gov: string, city: string): string[] =>
  gov && city && TUNISIA_LOCATIONS[gov]?.[city] ? TUNISIA_LOCATIONS[gov][city] : [];

export default function SubmitPropertyPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [dossierRef, setDossierRef] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Type & Objectif
  const [propertyType, setPropertyType] = useState<PropertyCategory>('Villa');
  const [objective, setObjective] = useState<UniverseType>('VENTE');

  // Step 2: Localisation
  const [gouvernorat, setGouvernorat] = useState<string>('Sfax');
  const [city, setCity] = useState<string>('Sfax Ville');
  const [district, setDistrict] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [googleMapsLink, setGoogleMapsLink] = useState<string>('');

  // Step 3: Dimensions de base
  const [surfaceM2, setSurfaceM2] = useState<number>(0);
  const [bedrooms, setBedrooms] = useState<number>(0);
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');

  // Step 4: Questions spécifiques par type
  const [specific, setSpecific] = useState<SpecificDetails>({
    hasPool: false,
    hasGarden: false,
    hasGarage: false,
    hasTerrace: false,
    hasElevator: false,
    hasBalakon: false,
    hasRooftop: false,
    panoramicView: false,
    conciergeService: false,
    bathrooms: 2,
    parkingSpots: 1,
    isNew: false,
  });
  const setSp = (key: keyof SpecificDetails, value: SpecificDetails[keyof SpecificDetails]) =>
    setSpecific((prev) => ({ ...prev, [key]: value }));

  // Step 5: Identité
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerPhone, setOwnerPhone] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');

  // Step 6: Photos & Notes
  const [uploadedPhotos, setUploadedPhotos] = useState<{ id: string; url: string; name: string }[]>([]);
  const [details, setDetails] = useState<string>('');

  // ─── Photo Handlers ───────────────────────────────────────────────
  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedPhotos((prev) => [
            ...prev,
            { id: `img-${Date.now()}-${Math.random()}`, url: e.target!.result as string, name: file.name },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };
  const handleRemovePhoto = (id: string) =>
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
  const handleAddDemoPhotos = () =>
    setUploadedPhotos([
      { id: 'p-1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', name: 'Façade Principale & Jardin' },
      { id: 'p-2', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', name: 'Salon de Réception' },
      { id: 'p-3', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', name: 'Piscine & Terrasse' },
      { id: 'p-4', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', name: 'Suite Principale' },
    ]);

  // ─── Nav ───────────────────────────────────────────────────────────
  const TOTAL_STEPS = 6;
  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicWhatsappUrl, setDynamicWhatsappUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) { nextStep(); return; }

    const refCode = `DOS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setDossierRef(refCode);
    setIsSubmitting(true);

    const submissionPayload = {
      propertyType,
      objective,
      surfaceM2: Number(surfaceM2) || 0,
      bedrooms: Number(bedrooms) || 0,
      estimatedValue: Number(estimatedPrice) || undefined,
      gouvernorat,
      city,
      district,
      address,
      googleMapsLink,
      ownerName: ownerName || 'Propriétaire Anonyme',
      ownerPhone: ownerPhone || '+216 -- --- ---',
      ownerEmail: ownerEmail || '',
      details,
      specificDetails: specific,
      photos: uploadedPhotos.map((p) => p.url),
    };

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });
      const data = await res.json();
      if (data.success && data.whatsappLink) {
        setDynamicWhatsappUrl(data.whatsappLink);
      }
    } catch (err) {
      console.warn('API submission fallback to local:', err);
    } finally {
      setIsSubmitting(false);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('vr_owner_submissions') || '[]');
      localStorage.setItem('vr_owner_submissions', JSON.stringify([{ ...submissionPayload, refCode, id: `sub-${Date.now()}` }, ...existing]));
    } catch {}
    setSubmitted(true);
  };

  const whatsappMessage = `Bonjour Villa Regia, dossier ${dossierRef} — ${propertyType} (${objective}) — ${district}, ${city}, ${gouvernorat} — ${surfaceM2}m² — ${estimatedPrice} TND — Propriétaire: ${ownerName} (${ownerPhone})${googleMapsLink ? ` — Maps: ${googleMapsLink}` : ''}`;
  const whatsappUrl = dynamicWhatsappUrl || `https://wa.me/21698123456?text=${encodeURIComponent(whatsappMessage)}`;


  // ─── Step Labels ────────────────────────────────────────────────────
  const stepLabels = ['Type & Objectif', 'Localisation', 'Dimensions', specific.isNew !== undefined ? 'Caractéristiques' : 'Détails', 'Identité', 'Photos'];

  // ─── Specific Questions Component ───────────────────────────────────
  const renderSpecificStep = () => {
    switch (propertyType) {
      case 'Villa':
        return (
          <div className="space-y-5">
            <div>
              <p className={labelCls}>Équipements extérieurs</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'hasPool', label: 'Piscine', icon: Waves },
                  { key: 'hasGarden', label: 'Jardin', icon: Trees },
                  { key: 'hasGarage', label: 'Garage', icon: Car },
                  { key: 'hasTerrace', label: 'Terrasse', icon: SquareStack },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button" onClick={() => setSp(key as keyof SpecificDetails, !specific[key as keyof SpecificDetails])}
                    className={toggleCls(!!specific[key as keyof SpecificDetails])}>
                    <Icon className="w-4 h-4 mx-auto mb-1" />{label}
                  </button>
                ))}
              </div>
            </div>
            {specific.hasGarden && (
              <div><label className={labelCls}>Surface du jardin (m²)</label>
                <input type="number" className={inputCls} placeholder="ex: 300" value={specific.gardenM2 || ''} onChange={e => setSp('gardenM2', Number(e.target.value))} /></div>
            )}
            {specific.hasPool && (
              <div><label className={labelCls}>Type de piscine</label>
                <div className="relative"><select className={inputCls + ' appearance-none pr-10'} value={specific.poolType || ''} onChange={e => setSp('poolType', e.target.value)}>
                  <option value="">Sélectionner...</option>
                  <option value="Débordement">Piscine à débordement</option>
                  <option value="Standard">Piscine standard</option>
                  <option value="Miroir">Piscine miroir</option>
                  <option value="Intérieure">Piscine intérieure</option>
                </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" /></div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelCls}>Salles de bain</label>
                <input type="number" min={1} className={inputCls} value={specific.bathrooms || ''} onChange={e => setSp('bathrooms', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Places de parking</label>
                <input type="number" min={0} className={inputCls} value={specific.parkingSpots || ''} onChange={e => setSp('parkingSpots', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Année de construction</label>
                <input type="number" min={1950} max={2026} className={inputCls} placeholder="ex: 2018" value={specific.yearBuilt || ''} onChange={e => setSp('yearBuilt', Number(e.target.value))} /></div>
            </div>
            <div>
              <p className={labelCls}>Type de titre foncier</p>
              <div className="relative"><select className={inputCls + ' appearance-none pr-10'} value={specific.titreType || ''} onChange={e => setSp('titreType', e.target.value)}>
                <option value="">Sélectionner...</option>
                <option value="TF Individuel">Titre foncier individuel</option>
                <option value="TF En Cours">Titre foncier en cours</option>
                <option value="Hissah">Hissah (indivision)</option>
                <option value="Autre">Autre</option>
              </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" /></div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSp('isNew', !specific.isNew)} className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 ${specific.isNew ? 'bg-brand-gold' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${specific.isNew ? 'left-[26px]' : 'left-0.5'}`} />
              </button>
              <span className="text-xs text-white/70">Construction neuve (moins de 5 ans)</span>
            </div>
          </div>
        );

      case 'Appartement':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Étage de l'appartement</label>
                <input type="number" min={0} className={inputCls} placeholder="ex: 3" value={specific.floor ?? ''} onChange={e => setSp('floor', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Nombre d'étages (immeuble)</label>
                <input type="number" min={1} className={inputCls} placeholder="ex: 7" value={specific.totalFloors ?? ''} onChange={e => setSp('totalFloors', Number(e.target.value))} /></div>
            </div>
            <div>
              <p className={labelCls}>Équipements & Services</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'hasElevator', label: 'Ascenseur', icon: Zap },
                  { key: 'hasBalakon', label: 'Balcon', icon: DoorOpen },
                  { key: 'hasGarage', label: 'Parking', icon: Car },
                  { key: 'hasTerrace', label: 'Terrasse', icon: SquareStack },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button" onClick={() => setSp(key as keyof SpecificDetails, !specific[key as keyof SpecificDetails])}
                    className={toggleCls(!!specific[key as keyof SpecificDetails])}>
                    <Icon className="w-4 h-4 mx-auto mb-1" />{label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={labelCls}>Type de résidence</p>
              <div className="relative"><select className={inputCls + ' appearance-none pr-10'} value={specific.residenceType || ''} onChange={e => setSp('residenceType', e.target.value)}>
                <option value="">Sélectionner...</option>
                <option value="Résidence sécurisée">Résidence sécurisée avec gardien</option>
                <option value="Résidence standing">Résidence haut standing</option>
                <option value="Immeuble classique">Immeuble classique</option>
                <option value="Résidence neuve">Résidence neuve (livraison récente)</option>
              </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelCls}>Salles de bain</label>
                <input type="number" min={1} className={inputCls} value={specific.bathrooms || ''} onChange={e => setSp('bathrooms', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Places de parking</label>
                <input type="number" min={0} className={inputCls} value={specific.parkingSpots || ''} onChange={e => setSp('parkingSpots', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Année de construction</label>
                <input type="number" min={1950} max={2026} className={inputCls} placeholder="ex: 2015" value={specific.yearBuilt || ''} onChange={e => setSp('yearBuilt', Number(e.target.value))} /></div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSp('isNew', !specific.isNew)} className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 ${specific.isNew ? 'bg-brand-gold' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${specific.isNew ? 'left-[26px]' : 'left-0.5'}`} />
              </button>
              <span className="text-xs text-white/70">Appartement neuf / vente directe promoteur</span>
            </div>
          </div>
        );

      case 'Duplex':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Nombre de niveaux du duplex</label>
                <div className="flex gap-2">
                  {[2, 3].map(n => (
                    <button key={n} type="button" onClick={() => setSp('duplexFloors', n)} className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${specific.duplexFloors === n ? 'bg-brand-gold text-brand-navy border-brand-gold' : 'bg-white/5 border-white/10 text-white/60'}`}>
                      {n} niveaux
                    </button>
                  ))}
                </div>
              </div>
              <div><label className={labelCls}>Surface par niveau (m²)</label>
                <input type="number" className={inputCls} placeholder="ex: 180" value={surfaceM2 / (specific.duplexFloors || 2) || ''} readOnly /></div>
            </div>
            <div>
              <p className={labelCls}>Équipements & Atouts</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'hasRooftop', label: 'Rooftop', icon: Crown },
                  { key: 'hasTerrace', label: 'Terrasse', icon: SquareStack },
                  { key: 'hasGarage', label: 'Garage', icon: Car },
                  { key: 'hasPool', label: 'Piscine', icon: Waves },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button" onClick={() => setSp(key as keyof SpecificDetails, !specific[key as keyof SpecificDetails])}
                    className={toggleCls(!!specific[key as keyof SpecificDetails])}>
                    <Icon className="w-4 h-4 mx-auto mb-1" />{label}
                  </button>
                ))}
              </div>
            </div>
            {specific.hasRooftop && (
              <div><label className={labelCls}>Surface du rooftop (m²)</label>
                <input type="number" className={inputCls} placeholder="ex: 120" value={specific.roofM2 || ''} onChange={e => setSp('roofM2', Number(e.target.value))} /></div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelCls}>Salles de bain</label>
                <input type="number" min={1} className={inputCls} value={specific.bathrooms || ''} onChange={e => setSp('bathrooms', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Places de parking</label>
                <input type="number" min={0} className={inputCls} value={specific.parkingSpots || ''} onChange={e => setSp('parkingSpots', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Année de construction</label>
                <input type="number" min={1950} max={2026} className={inputCls} placeholder="ex: 2020" value={specific.yearBuilt || ''} onChange={e => setSp('yearBuilt', Number(e.target.value))} /></div>
            </div>
          </div>
        );

      case 'Penthouse':
        return (
          <div className="space-y-5">
            <div>
              <p className={labelCls}>Caractéristiques exclusives</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { key: 'panoramicView', label: 'Vue panoramique', icon: Crown },
                  { key: 'hasPool', label: 'Piscine privée', icon: Waves },
                  { key: 'hasTerrace', label: 'Grande terrasse', icon: SquareStack },
                  { key: 'conciergeService', label: 'Conciergerie', icon: User },
                  { key: 'hasGarage', label: 'Parking VIP', icon: Car },
                  { key: 'hasElevator', label: 'Ascenseur privé', icon: Zap },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button" onClick={() => setSp(key as keyof SpecificDetails, !specific[key as keyof SpecificDetails])}
                    className={toggleCls(!!specific[key as keyof SpecificDetails])}>
                    <Icon className="w-4 h-4 mx-auto mb-1" />{label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Surface de la terrasse (m²)</label>
                <input type="number" className={inputCls} placeholder="ex: 200" value={specific.terraceM2 || ''} onChange={e => setSp('terraceM2', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Étage du penthouse</label>
                <input type="number" min={1} className={inputCls} placeholder="ex: 12 (dernier étage)" value={specific.floor ?? ''} onChange={e => setSp('floor', Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelCls}>Salles de bain</label>
                <input type="number" min={1} className={inputCls} value={specific.bathrooms || ''} onChange={e => setSp('bathrooms', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Places de parking VIP</label>
                <input type="number" min={0} className={inputCls} value={specific.parkingSpots || ''} onChange={e => setSp('parkingSpots', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Année de construction</label>
                <input type="number" min={1980} max={2026} className={inputCls} placeholder="ex: 2022" value={specific.yearBuilt || ''} onChange={e => setSp('yearBuilt', Number(e.target.value))} /></div>
            </div>
          </div>
        );
    }
  };

  const TypeIcon = PROPERTY_ICONS[propertyType] || Home;

  return (
    <div className="pt-24 pb-20 bg-brand-navy min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] uppercase text-brand-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Service Propriétaires Prestige</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-light text-brand-travertine leading-tight">
            Proposer un Patrimoine<br />
            <span className="text-brand-gold">à Villa Regia</span>
          </h1>
          <p className="text-sm text-white/50 max-w-lg mx-auto font-light leading-relaxed">
            Confiez-nous l'estimation, la sélection et la mise en valeur confidentielle de votre bien à Sfax.
          </p>
        </div>

        {/* ── Confidentiality Banner ── */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-brand-gold/10 to-transparent border border-brand-gold/20 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-brand-gold shrink-0 mt-0.5" />
          <div className="text-xs text-white/70 leading-relaxed">
            <span className="font-bold text-brand-gold uppercase tracking-wider block mb-0.5">Garantie de Discrétion & Confidentialité</span>
            Toutes les informations transmises restent strictement confidentielles et réservées au comité d'évaluation privé Villa Regia.
          </div>
        </div>

        {/* ── Wizard Card ── */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

          {/* ── Step Progress Header ── */}
          {!submitted && (
            <div className="p-5 sm:p-6 border-b border-white/8">
              {/* Mobile: step counter */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-brand-gold" />
                  <span className="text-xs font-mono font-bold text-brand-gold uppercase tracking-widest">
                    Étape {step} / {TOTAL_STEPS}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40">{Math.round((step / TOTAL_STEPS) * 100)}% complété</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-brand-gold to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
              </div>
              {/* Step Dots (hidden on mobile, visible sm+) */}
              <div className="hidden sm:flex gap-1 items-center">
                {stepLabels.map((label, i) => (
                  <div key={i} className="flex items-center gap-1 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${i + 1 < step ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/40' : i + 1 === step ? 'bg-brand-gold text-brand-navy shadow-lg shadow-brand-gold/30' : 'bg-white/8 text-white/30 border border-white/10'}`}>
                      {i + 1 < step ? '✓' : i + 1}
                    </div>
                    {i < stepLabels.length - 1 && <div className={`flex-1 h-px transition-all ${i + 1 < step ? 'bg-emerald-500/30' : 'bg-white/8'}`} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Form Area ── */}
          <div className="p-5 sm:p-8">
            {submitted ? (
              /* ── Confirmation ── */
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-4 py-1.5 rounded-full border border-brand-gold/20 inline-block">
                    Dossier Enregistré : {dossierRef}
                  </span>
                  <h2 className="font-editorial text-3xl font-light text-white pt-2">
                    Merci, {ownerName || 'Cher Propriétaire'}
                  </h2>
                  <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
                    Votre dossier {propertyType} a été transmis au comité de sélection Villa Regia. Un conseiller dédié vous contactera sous 24h.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all">
                    <MessageCircle className="w-4 h-4" />
                    <span>Confirmer sur WhatsApp</span>
                  </a>
                  <Link href="/"
                    className="bg-white/8 hover:bg-white/15 text-white/70 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl flex items-center justify-center border border-white/10 transition-all">
                    Retour à l'Accueil
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── STEP 1: Type & Objectif ── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-editorial text-xl sm:text-2xl text-white font-light mb-1">Type de Bien & Objectif</h3>
                      <p className="text-xs text-white/40">Sélectionnez le type de propriété que vous souhaitez proposer.</p>
                    </div>

                    <div>
                      <p className={labelCls}>Catégorie du Bien</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(['Villa', 'Appartement', 'Duplex', 'Penthouse'] as PropertyCategory[]).map((cat) => {
                          const Icon = PROPERTY_ICONS[cat] || Home;
                          const isActive = propertyType === cat;
                          return (
                            <button key={cat} type="button" onClick={() => setPropertyType(cat)}
                              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${isActive ? `bg-gradient-to-b ${PROPERTY_COLORS[cat]} shadow-lg` : 'bg-white/5 border-white/8 hover:border-white/20'}`}>
                              <Icon className={`w-6 h-6 ${isActive ? 'text-brand-gold' : 'text-white/40'}`} />
                              <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-white/50'}`}>{cat}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className={labelCls}>Objectif / Destination</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { key: 'VENTE', label: 'Vente', desc: 'Cession définitive' },
                          { key: 'RESIDENCE', label: 'Résidence', desc: 'Location long terme' },
                          { key: 'LUXE', label: 'Séjour Luxe', desc: 'Location saisonnière' },
                          { key: 'EVENT', label: 'Événementiel', desc: 'Réception & mariages' },
                        ].map((u) => (
                          <button key={u.key} type="button" onClick={() => setObjective(u.key as UniverseType)}
                            className={`p-3 rounded-xl border flex flex-col gap-0.5 transition-all text-left ${objective === u.key ? 'bg-brand-gold/15 border-brand-gold/50 shadow' : 'bg-white/5 border-white/8 hover:border-white/20'}`}>
                            <span className={`text-xs font-bold uppercase tracking-wider ${objective === u.key ? 'text-brand-gold' : 'text-white/60'}`}>{u.label}</span>
                            <span className="text-[10px] text-white/30">{u.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Localisation ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-editorial text-xl sm:text-2xl text-white font-light mb-1">Localisation Géographique</h3>
                      <p className="text-xs text-white/40">Sélectionnez votre gouvernorat, ville et quartier pour une estimation précise.</p>
                    </div>

                    {/* Row 1: Gouvernorat */}
                    <div>
                      <label className={labelCls}><MapPin className="inline w-3 h-3 mr-1" />Gouvernorat / Région</label>
                      <div className="relative">
                        <select
                          className={inputCls + ' appearance-none pr-10'}
                          value={gouvernorat}
                          onChange={e => {
                            setGouvernorat(e.target.value);
                            setCity('');
                            setDistrict('');
                          }}
                        >
                          <option value="">Sélectionner un gouvernorat...</option>
                          {GOUVERNORATS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Row 2: Ville */}
                    {gouvernorat && (
                      <div>
                        <label className={labelCls}>Ville / Délégation</label>
                        <div className="relative">
                          <select
                            className={inputCls + ' appearance-none pr-10'}
                            value={city}
                            onChange={e => {
                              setCity(e.target.value);
                              setDistrict('');
                            }}
                          >
                            <option value="">Sélectionner une ville...</option>
                            {getCities(gouvernorat).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Row 3: Quartier / Route */}
                    {city && getDistricts(gouvernorat, city).length > 0 && (
                      <div>
                        <label className={labelCls}>Quartier / Route / Secteur</label>
                        <div className="relative">
                          <select
                            className={inputCls + ' appearance-none pr-10'}
                            value={district}
                            onChange={e => setDistrict(e.target.value)}
                          >
                            <option value="">Sélectionner un quartier ou une route...</option>
                            {getDistricts(gouvernorat, city).map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Row 4: Adresse précise */}
                    <div>
                      <label className={labelCls}>Adresse précise (optionnel — confidentielle)</label>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="ex: Route de la Soukra Km 3, Villa n°12..."
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                      />
                    </div>

                    {/* Row 5: Google Maps Link */}
                    <div>
                      <label className={labelCls}>
                        <MapPin className="inline w-3 h-3 mr-1" />
                        Lien Google Maps (placement exact)
                      </label>
                      <input
                        type="url"
                        className={inputCls}
                        placeholder="https://maps.google.com/?q=..."
                        value={googleMapsLink}
                        onChange={e => setGoogleMapsLink(e.target.value)}
                      />
                      <p className="text-[10px] text-white/30 mt-1.5 leading-relaxed">
                        Ouvrez Google Maps, trouvez votre bien, appuyez longuement sur la position et copiez le lien de partage ici.
                      </p>
                      {googleMapsLink && (
                        <a
                          href={googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono text-brand-gold hover:underline"
                        >
                          <MapPin className="w-3 h-3" />
                          Vérifier la position sur Google Maps →
                        </a>
                      )}
                    </div>

                    {/* Summary badge */}
                    {gouvernorat && city && (
                      <div className="p-3 rounded-lg bg-brand-gold/8 border border-brand-gold/20 text-[10px] font-mono text-brand-travertine/70 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>
                          <span className="text-brand-gold font-bold">{gouvernorat}</span>
                          {city && <> &rsaquo; {city}</>}
                          {district && <> &rsaquo; {district}</>}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3: Dimensions ── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-editorial text-xl sm:text-2xl text-white font-light mb-1">
                        Dimensions de la {propertyType}
                      </h3>
                      <p className="text-xs text-white/40">Ces informations permettront une estimation précise de la valeur marchande.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Surface habitable (m²)</label>
                        <input type="number" min={0} className={inputCls} placeholder="ex: 450" value={surfaceM2 || ''} onChange={e => setSurfaceM2(Number(e.target.value))} />
                      </div>
                      <div>
                        <label className={labelCls}>Nombre de chambres</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5,6].map(n => (
                            <button key={n} type="button" onClick={() => setBedrooms(n)}
                              className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${bedrooms === n ? 'bg-brand-gold text-brand-navy border-brand-gold' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}>
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Prix souhaité / estimation (TND)</label>
                      <div className="relative">
                        <input type="text" className={inputCls + ' pr-14 font-mono'} placeholder="ex: 1 800 000"
                          value={estimatedPrice} onChange={e => setEstimatedPrice(e.target.value.replace(/[^0-9]/g, ''))} />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-white/30">TND</span>
                      </div>
                      {estimatedPrice && (
                        <span className="text-[11px] text-brand-gold/70 font-mono block mt-1.5">
                          ≈ {Number(estimatedPrice).toLocaleString('fr-TN')} dinars tunisiens
                        </span>
                      )}
                      <p className="text-[10px] text-white/30 mt-1">L'équipe Villa Regia effectuera une contre-expertise gratuite.</p>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Caractéristiques spécifiques ── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIcon className="w-5 h-5 text-brand-gold" />
                        <h3 className="font-editorial text-xl sm:text-2xl text-white font-light">
                          Caractéristiques — {propertyType}
                        </h3>
                      </div>
                      <p className="text-xs text-white/40">Ces questions sont spécifiques au type de bien que vous proposez.</p>
                    </div>
                    {renderSpecificStep()}
                  </div>
                )}

                {/* ── STEP 5: Identité Propriétaire ── */}
                {step === 5 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-editorial text-xl sm:text-2xl text-white font-light mb-1">Identité du Propriétaire</h3>
                      <p className="text-xs text-white/40">Vos coordonnées resteront strictement confidentielles.</p>
                    </div>
                    <div>
                      <label className={labelCls}><User className="inline w-3 h-3 mr-1" />Nom & Prénom</label>
                      <input required type="text" placeholder="Mme. / M. ..." className={inputCls} value={ownerName} onChange={e => setOwnerName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}><Phone className="inline w-3 h-3 mr-1" />Téléphone Direct</label>
                        <input required type="tel" placeholder="+216 98 --- ---" className={inputCls} value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}><Mail className="inline w-3 h-3 mr-1" />Adresse Email</label>
                        <input type="email" placeholder="votreemail@domaine.tn" className={inputCls} value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/8 text-xs text-white/40 leading-relaxed">
                      🔒 Vos données personnelles ne seront jamais partagées avec des tiers et seront utilisées uniquement pour l'évaluation de votre dossier par l'équipe Villa Regia.
                    </div>
                  </div>
                )}

                {/* ── STEP 6: Photos & Remarques ── */}
                {step === 6 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-editorial text-xl sm:text-2xl text-white font-light mb-1">Photos & Description</h3>
                      <p className="text-xs text-white/40">Les photos augmentent vos chances d'évaluation prioritaire de 3x.</p>
                    </div>

                    {/* ── Drop Zone ── */}
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragging ? 'border-brand-gold bg-brand-gold/10 scale-[1.01]' : 'border-white/15 bg-white/3 hover:border-brand-gold/40 hover:bg-white/5'}`}
                    >
                      <input ref={fileInputRef} type="file" id="owner-photo-input" accept="image/*" multiple onChange={e => processFiles(e.target.files)} className="hidden" />
                      <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-brand-gold' : 'text-white/30'}`} />
                      <p className="text-sm text-white/60 mb-4">
                        {isDragging ? 'Déposez vos photos ici !' : 'Glissez & déposez vos photos ici'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <label htmlFor="owner-photo-input"
                          className="inline-flex items-center gap-2 bg-brand-gold hover:bg-amber-400 text-brand-navy font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-brand-gold/20 transition-all">
                          <ImagePlus className="w-4 h-4" />
                          Parcourir vos photos
                        </label>
                        <button type="button" onClick={handleAddDemoPhotos}
                          className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 text-white/70 font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider border border-white/10 transition-all">
                          + Photos Démo Luxe
                        </button>
                      </div>
                      <p className="text-[10px] text-white/30 mt-3">JPG, PNG, WEBP • Max 20 photos</p>
                    </div>

                    {/* ── Photo Grid ── */}
                    {uploadedPhotos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-gold">
                            {uploadedPhotos.length} photo{uploadedPhotos.length > 1 ? 's' : ''} chargée{uploadedPhotos.length > 1 ? 's' : ''}
                          </span>
                          <button type="button" onClick={() => setUploadedPhotos([])}
                            className="text-[10px] text-red-400/70 hover:text-red-400 font-mono uppercase tracking-wider transition-colors">
                            Tout supprimer
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {uploadedPhotos.map((photo, idx) => (
                            <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square border border-white/10 shadow">
                              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              {idx === 0 && (
                                <span className="absolute bottom-1.5 left-1.5 bg-brand-gold text-brand-navy text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                                  ★ Couverture
                                </span>
                              )}
                              <button type="button" onClick={() => handleRemovePhoto(photo.id)}
                                className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Description ── */}
                    <div>
                      <label className={labelCls}>Description & Particularités du Bien</label>
                      <textarea rows={4} className={inputCls} value={details} onChange={e => setDetails(e.target.value)}
                        placeholder={`Décrivez votre ${propertyType}: prestations marquantes, titre foncier, rénovations récentes, équipements exclusifs...`} />
                    </div>
                  </div>
                )}

                {/* ── Nav Buttons ── */}
                <div className="pt-6 border-t border-white/8 flex justify-between items-center gap-4">
                  {step > 1 ? (
                    <button type="button" onClick={prevStep}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors px-4 py-2.5">
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Précédent</span>
                    </button>
                  ) : <div />}

                  {step < TOTAL_STEPS ? (
                    <button type="button" onClick={nextStep}
                      className="ml-auto inline-flex items-center gap-2 bg-brand-gold hover:bg-amber-400 text-brand-navy px-6 sm:px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-gold/20 transition-all hover:scale-105">
                      <span>Suivant</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit"
                      className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-brand-gold to-amber-400 text-brand-navy px-6 sm:px-10 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-brand-gold/30 hover:shadow-brand-gold/50 transition-all hover:scale-105">
                      <Send className="w-4 h-4" />
                      <span>Soumettre mon Dossier</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Trust Badges Footer ── */}
        {!submitted && (
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: ShieldCheck, label: 'Discrétion totale' },
              { icon: CheckCircle2, label: 'Évaluation sous 24h' },
              { icon: Sparkles, label: 'Service sur-mesure' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/3 border border-white/5">
                <Icon className="w-5 h-5 text-brand-gold/70" />
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
