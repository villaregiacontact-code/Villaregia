export type UniverseType = 'VENTE' | 'RESIDENCE' | 'LUXE' | 'EVENT';

export type PropertyCategory = 
  | 'Villa'
  | 'Villa Semi-Construite'
  | 'Espace Commercial'
  | 'Fonds de Commerce'
  | 'Appartement'
  | 'Duplex'
  | 'Penthouse'
  | 'Terrain'
  | 'Terrain Agricole'
  | 'Domaine Événementiel'
  | 'Maison de Charme';

export type PropertyStatus = 'DISPONIBLE' | 'RÉSERVÉ' | 'VENDU' | 'LOUÉ' | 'SOUS OFFRE';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CONTENT_MANAGER' | 'CLIENT';

export type Permission = 
  | 'properties.create'
  | 'properties.read'
  | 'properties.update'
  | 'properties.delete'
  | 'properties.publish'
  | 'leads.read'
  | 'leads.update'
  | 'reservations.read'
  | 'reservations.manage'
  | 'content.manage'
  | 'users.manage'
  | 'settings.manage';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
  twoFactorVerified?: boolean;
  emailVerified?: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  title: {
    fr: string;
    ar: string;
    en: string;
  };
  universe: UniverseType;
  category: PropertyCategory;
  price: {
    amount: number;
    currency: 'TND' | 'EUR' | 'USD';
    period?: 'nuit' | 'mois' | 'total';
  };
  location: {
    city: string;
    district: string;
    country: string;
    address?: string;
    lat: number;
    lng: number;
    isExactPosition: boolean;
  };
  specs: {
    surfaceM2: number;
    bedrooms?: number;
    bathrooms?: number;
    livingRooms?: number;
    parkingSpaces?: number;
    constructible?: boolean;
    landType?: string;
    guestCapacity?: number;
    pool?: boolean;
    garden?: boolean;
    // Spécificités Villa Semi-Construite
    completionEstimate?: number; // Valeur d'estimation pour achever la construction (en TND)
    constructionStage?: string; // Stade actuel des travaux (ex: Gros œuvre achevé 65%, Hors d'eau/Hors d'air)
    // Spécificités Commercial & Fonds de commerce
    businessActivity?: string; // Vocation ou activité commerciale autorisée
    commercialSurfaceM2?: number; // Surface utile commerciale
    monthlyRentTND?: number; // Loyer mensuel des murs (TND / mois)
    linearFacadeMeters?: number; // Linéaire de vitrine (mètres)
    licenseIncluded?: boolean; // Licence commerciale incluse
  };
  images: {
    url: string;
    alt: string;
    isCover?: boolean;
  }[];
  description: {
    fr: string;
    ar: string;
    en: string;
  };
  story?: {
    fr: string;
    ar: string;
    en: string;
  };
  amenities: string[];
  status: PropertyStatus;
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  universe: UniverseType | 'ALL';
  category: PropertyCategory | 'ALL';
  city: string;
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  minSurface: number;
  hasPool?: boolean;
  hasGarden?: boolean;
  isConstructible?: boolean;
}

export interface BookingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalNights: number;
  pricePerNight: number;
  totalAmount: number;
  depositAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface EventQuoteRequest {
  id: string;
  eventType: 'Mariage' | 'Réception Privée' | 'Séminaire Enterprise' | 'Shooting Photo' | 'Gala';
  propertyId?: string;
  guestCount: number;
  eventDate: string;
  servicesNeeded: string[];
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes?: string;
  status: 'NOUVEAU' | 'EN_ETUDE' | 'DEVIS_ENVOYE' | 'ACCEPTE';
  createdAt: string;
}

export interface OwnerSubmission {
  id: string;
  refCode: string;
  propertyType: PropertyCategory;
  objective: UniverseType;
  gouvernorat?: string;
  city: string;
  district: string;
  address?: string;
  googleMapsLink?: string;
  surfaceM2: number;
  bedrooms?: number;
  estimatedValue?: number;
  estimatedPrice?: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  titleType?: string;
  titleNumber?: string;
  hasCertificate?: string;
  hasBuildingPermit?: string;
  tunisianLawCertified?: boolean;
  specificDetails?: Record<string, any>;
  details?: string;
  photos?: string[];
  // Spécificités Villa Semi-Construite & Commercial
  completionEstimate?: number;
  constructionStage?: string;
  businessActivity?: string;
  commercialSurfaceM2?: number;
  monthlyRentTND?: number;
  isPublished?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOUVEAU' | 'CONTACTE' | 'VISITE' | 'MANDAT_SIGNE';
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'WhatsApp' | 'Formulaire Contact' | 'Demande Visite' | 'Soumission Propriétaire' | 'Réservation';
  universe: UniverseType;
  propertyTitle?: string;
  status: 'Nouveau' | 'Contacté' | 'Visite' | 'Offre' | 'Conclu';
  notes?: string;
  assignedAgent?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: {
    fr: string;
    ar: string;
    en: string;
  };
  excerpt: {
    fr: string;
    ar: string;
    en: string;
  };
  content: {
    fr: string;
    ar: string;
    en: string;
  };
  category: 'Architecture' | 'Investissement' | 'Sfax Lifestyle' | 'Immobilier de Luxe';
  coverImage: string;
  readTime: string;
  publishedAt: string;
  author: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  action: string;
  target: string;
}
