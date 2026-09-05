import { Property, BookingRequest, Lead, OwnerSubmission, FilterState, EventQuoteRequest, BlogPost } from '@/types';
import { INITIAL_PROPERTIES, INITIAL_ARTICLES } from '@/data/properties';
import { supabase, isSupabaseConfigured } from './supabase';

import { ACCOUNTS_STORE, StoredUserAccount } from './authStore';
import {
  loadPersistedUsers,
  savePersistedUsers,
  loadPersistedSubmissions,
  savePersistedSubmissions,
  loadPersistedLeads,
  savePersistedLeads,
  loadPersistedBookings,
  savePersistedBookings,
  loadPersistedProperties,
  savePersistedProperties,
  loadPersistedArticles,
  savePersistedArticles,
} from './fileStorage';

// In-Memory & Persisted State (persists to JSON files on disk, Supabase if configured, syncs with runtime)
let localProperties: Property[] = loadPersistedProperties();

let localArticles: BlogPost[] = loadPersistedArticles();

let localBookings: BookingRequest[] = loadPersistedBookings();

let localLeads: Lead[] = loadPersistedLeads();

let localSubmissions: OwnerSubmission[] = loadPersistedSubmissions();

const DEFAULT_SUPERADMIN: StoredUserAccount = {
  id: 'user-superadmin-01',
  name: 'Yassine Aloulou (Directeur Général)',
  email: 'yassinealoulou6@gmail.com',
  phone: '+216 98 000 000',
  password: 'Yassine.123',
  role: 'SUPER_ADMIN',
  twoFactorEnabled: false,
  emailVerified: true,
  createdAt: '2026-09-02',
};

// Initialize users from disk storage
const persistedUsers = loadPersistedUsers();
let localUsers: StoredUserAccount[] = persistedUsers.length > 0
  ? persistedUsers
  : [DEFAULT_SUPERADMIN];

// Ensure DEFAULT_SUPERADMIN is always present
if (!localUsers.some(u => u.email.toLowerCase() === DEFAULT_SUPERADMIN.email)) {
  localUsers.unshift(DEFAULT_SUPERADMIN);
}

// Populate ACCOUNTS_STORE from localUsers
// Populate ACCOUNTS_STORE from localUsers
localUsers.forEach(u => {
  ACCOUNTS_STORE.set(u.email.toLowerCase().trim(), u);
});

// ----------------------------------------------------------------------------
// SUPABASE BIDIRECTIONAL NORMALIZATION & HYBRID MAPPING HELPERS
// ----------------------------------------------------------------------------

function normalizeSubmission(raw: any): OwnerSubmission {
  return {
    id: raw.id || `prop-sub-${Date.now()}`,
    refCode: raw.ref_code || raw.refCode || raw.id || `DOS-${Date.now()}`,
    propertyType: raw.property_type || raw.propertyType || 'Villa',
    objective: raw.objective || 'VENTE',
    surfaceM2: Number(raw.surface_m2 ?? raw.surfaceM2 ?? 0),
    bedrooms: Number(raw.bedrooms ?? 0),
    estimatedValue: Number(raw.estimated_value ?? raw.estimatedValue ?? raw.estimatedPrice ?? 0),
    estimatedPrice: Number(raw.estimated_value ?? raw.estimatedValue ?? raw.estimatedPrice ?? 0),
    city: raw.city || 'Sfax',
    district: raw.district || 'Centre',
    gouvernorat: raw.gouvernorat || 'Sfax',
    address: raw.address || '',
    googleMapsLink: raw.google_maps_link || raw.googleMapsLink || '',
    ownerName: raw.owner_name || raw.ownerName || 'Propriétaire',
    ownerPhone: raw.owner_phone || raw.ownerPhone || '',
    ownerEmail: raw.owner_email || raw.ownerEmail || '',
    titleType: raw.title_type || raw.titleType || '',
    titleNumber: raw.title_number || raw.titleNumber || '',
    hasCertificate: String(raw.has_certificate ?? raw.hasCertificate ?? ''),
    hasBuildingPermit: raw.has_building_permit || raw.hasBuildingPermit || '',
    tunisianLawCertified: Boolean(raw.tunisian_law_certified ?? raw.tunisianLawCertified ?? true),
    details: raw.details || '',
    specificDetails: raw.specific_details || raw.specificDetails || {},
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    status: raw.status || 'PENDING',
    isPublished: Boolean(raw.is_published ?? raw.isPublished ?? false),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

function toSupabaseSubmissionPayload(sub: OwnerSubmission): Record<string, any> {
  return {
    id: sub.id,
    ref_code: sub.refCode,
    property_type: sub.propertyType,
    objective: sub.objective,
    surface_m2: sub.surfaceM2,
    bedrooms: sub.bedrooms,
    estimated_value: sub.estimatedValue || sub.estimatedPrice,
    city: sub.city,
    district: sub.district,
    address: sub.address,
    owner_name: sub.ownerName,
    owner_phone: sub.ownerPhone,
    owner_email: sub.ownerEmail,
    details: sub.details,
    photos: sub.photos || [],
    status: sub.status,
    is_published: sub.isPublished || false,
    created_at: sub.createdAt,
  };
}

function normalizeBooking(raw: any): BookingRequest {
  return {
    id: raw.id || `res-${Date.now()}`,
    propertyId: raw.property_id || raw.propertyId || '',
    propertyTitle: raw.property_title || raw.propertyTitle || 'Villa de Luxe',
    guestName: raw.guest_name || raw.guestName || '',
    guestEmail: raw.guest_email || raw.guestEmail || '',
    guestPhone: raw.guest_phone || raw.guestPhone || '',
    checkIn: raw.check_in || raw.checkIn || '',
    checkOut: raw.check_out || raw.checkOut || '',
    guestsCount: Number(raw.guests_count ?? raw.guestsCount ?? raw.guests ?? 1),
    totalNights: Number(raw.total_nights ?? raw.totalNights ?? 1),
    pricePerNight: Number(raw.price_per_night ?? raw.pricePerNight ?? 0),
    totalAmount: Number(raw.total_amount ?? raw.totalAmount ?? raw.price ?? 0),
    depositAmount: Number(raw.deposit_amount ?? raw.depositAmount ?? 0),
    status: raw.status || 'PENDING',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

function toSupabaseBookingPayload(b: BookingRequest): Record<string, any> {
  return {
    id: b.id,
    property_id: b.propertyId,
    property_title: b.propertyTitle,
    guest_name: b.guestName,
    guest_email: b.guestEmail,
    guest_phone: b.guestPhone,
    check_in: b.checkIn,
    check_out: b.checkOut,
    guests_count: b.guestsCount || 1,
    total_nights: b.totalNights || 1,
    price_per_night: b.pricePerNight || 0,
    total_amount: b.totalAmount || 0,
    deposit_amount: b.depositAmount || 0,
    status: b.status,
    created_at: b.createdAt,
  };
}

function normalizeLead(raw: any): Lead {
  return {
    id: raw.id || `lead-${Date.now()}`,
    name: raw.name || '',
    email: raw.email || '',
    phone: raw.phone || '',
    source: raw.source || 'Formulaire Contact',
    universe: raw.universe || 'VENTE',
    propertyTitle: raw.property_title || raw.propertyTitle || '',
    status: raw.status || 'Nouveau',
    notes: raw.notes || '',
    assignedAgent: raw.assigned_agent || raw.assignedAgent || '',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

function toSupabaseLeadPayload(l: Lead): Record<string, any> {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    source: l.source,
    universe: l.universe,
    property_title: l.propertyTitle,
    status: l.status,
    notes: l.notes,
    assigned_agent: l.assignedAgent,
    created_at: l.createdAt,
  };
}

function normalizeUser(raw: any): StoredUserAccount {
  return {
    id: raw.id || `usr-${Date.now()}`,
    name: raw.name || '',
    email: (raw.email || '').toLowerCase().trim(),
    phone: raw.phone || '',
    password: raw.password || '',
    role: raw.role || 'CLIENT',
    twoFactorEnabled: Boolean(raw.two_factor_enabled ?? raw.twoFactorEnabled ?? false),
    emailVerified: Boolean(raw.email_verified ?? raw.emailVerified ?? true),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString().split('T')[0],
  };
}

function toSupabaseUserPayload(u: StoredUserAccount): Record<string, any> {
  return {
    id: u.id,
    name: u.name,
    email: u.email.toLowerCase().trim(),
    phone: u.phone,
    password: u.password,
    role: u.role,
    two_factor_enabled: Boolean(u.twoFactorEnabled),
    email_verified: Boolean(u.emailVerified),
    created_at: u.createdAt,
  };
}

// Helper functions for properties
export async function getProperties(filters?: Partial<FilterState>): Promise<Property[]> {
  const freshProps = loadPersistedProperties();
  if (freshProps.length > 0) localProperties = freshProps;
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('properties').select('*');
      if (filters?.universe && filters.universe !== 'ALL') {
        query = query.eq('universe', filters.universe);
      }
      if (filters?.category && filters.category !== 'ALL') {
        query = query.eq('category', filters.category);
      }
      if (filters?.city && filters.city !== 'ALL') {
        query = query.ilike('city', `%${filters.city}%`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Property[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using fallback memory state:', e);
    }
  }

  if (localProperties.length === 0) {
    localProperties = [...INITIAL_PROPERTIES];
  }

  // Fallback to local memory filter
  let result = [...localProperties];

  if (filters) {
    if (filters.universe && filters.universe !== 'ALL') {
      result = result.filter(p => p.universe === filters.universe);
    }
    if (filters.category && filters.category !== 'ALL') {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters.city && filters.city !== 'ALL') {
      const cityQuery = filters.city.toLowerCase();
      result = result.filter(p => p.location.city.toLowerCase().includes(cityQuery) || p.location.district.toLowerCase().includes(cityQuery));
    }
    if (filters.minPrice && filters.minPrice > 0) {
      const minP = filters.minPrice;
      result = result.filter(p => (p.price?.amount || 0) >= minP);
    }
    if (filters.maxPrice && filters.maxPrice > 0) {
      const maxP = filters.maxPrice;
      result = result.filter(p => (p.price?.amount || 0) <= maxP);
    }
    if (filters.minBedrooms && filters.minBedrooms > 0) {
      const minB = filters.minBedrooms;
      result = result.filter(p => (p.specs?.bedrooms || 0) >= minB);
    }
    if (filters.minSurface && filters.minSurface > 0) {
      const minS = filters.minSurface;
      result = result.filter(p => (p.specs?.surfaceM2 || 0) >= minS);
    }
    if (filters.hasPool) {
      result = result.filter(p => p.specs?.pool === true);
    }
    if (filters.hasGarden) {
      result = result.filter(p => p.specs?.garden === true);
    }
    if (filters.isConstructible) {
      result = result.filter(p => p.specs?.constructible === true);
    }
  }

  return result;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
      if (!error && data) return data as Property;
    } catch (e) {
      console.warn('Supabase fetch single property failed:', e);
    }
  }
  return localProperties.find(p => p.id === id) || null;
}

export async function createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
  const newProperty: Property = {
    ...property,
    id: `vr-prop-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('properties').insert([newProperty]).select().single();
      if (!error && data) {
        localProperties.unshift(data as Property);
        savePersistedProperties(localProperties);
        return data as Property;
      }
    } catch (e) {
      console.warn('Supabase insert property failed:', e);
    }
  }

  localProperties.unshift(newProperty);
  savePersistedProperties(localProperties);
  return newProperty;
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('properties').update(updates).eq('id', id).select().single();
      if (!error && data) {
        const idx = localProperties.findIndex(p => p.id === id);
        if (idx >= 0) localProperties[idx] = data as Property;
        savePersistedProperties(localProperties);
        return data as Property;
      }
    } catch (e) {
      console.warn('Supabase update property failed:', e);
    }
  }

  const idx = localProperties.findIndex(p => p.id === id);
  if (idx >= 0) {
    localProperties[idx] = {
      ...localProperties[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    savePersistedProperties(localProperties);
    return { ...localProperties[idx] };
  }
  return null;
}

export async function updatePropertyStatus(id: string, status: Property['status']): Promise<Property | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('properties').update({ status }).eq('id', id).select().single();
      if (!error && data) {
        const idx = localProperties.findIndex(p => p.id === id);
        if (idx >= 0) localProperties[idx] = data as Property;
        savePersistedProperties(localProperties);
        return data as Property;
      }
    } catch (e) {
      console.warn('Supabase update status failed:', e);
    }
  }

  const prop = localProperties.find(p => p.id === id);
  if (prop) {
    prop.status = status;
    prop.updatedAt = new Date().toISOString();
    savePersistedProperties(localProperties);
    return { ...prop };
  }
  return null;
}

export async function deleteProperty(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('properties').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete property failed:', e);
    }
  }
  localProperties = localProperties.filter(p => p.id !== id);
  savePersistedProperties(localProperties);
  return true;
}

// Bookings
export async function getBookings(): Promise<BookingRequest[]> {
  const freshBookings = loadPersistedBookings();
  if (freshBookings.length > 0) localBookings = freshBookings;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const supaBookings = data.map(normalizeBooking);
        const map = new Map<string, BookingRequest>();
        localBookings.forEach(b => map.set(b.id, b));
        supaBookings.forEach(b => { if (!map.has(b.id)) map.set(b.id, b); });
        const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localBookings = merged;
        savePersistedBookings(localBookings);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase fetch bookings failed:', e);
    }
  }
  return [...localBookings];
}

export async function createBooking(booking: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>): Promise<BookingRequest> {
  const newBooking: BookingRequest = {
    ...booking,
    id: `res-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = toSupabaseBookingPayload(newBooking);
      const { data, error } = await supabase.from('bookings').insert([payload]).select().single();
      if (!error && data) {
        const normalized = normalizeBooking(data);
        localBookings.unshift(normalized);
        savePersistedBookings(localBookings);
        return normalized;
      }
    } catch (e) {
      console.warn('Supabase insert booking failed:', e);
    }
  }

  localBookings.unshift(newBooking);
  savePersistedBookings(localBookings);
  
  // Create an automatic Lead in CRM
  await createLead({
    name: newBooking.guestName,
    email: newBooking.guestEmail,
    phone: newBooking.guestPhone,
    source: 'Réservation',
    universe: 'LUXE',
    propertyTitle: newBooking.propertyTitle,
    notes: `Réservation enregistrée du ${newBooking.checkIn} au ${newBooking.checkOut} (${newBooking.guestsCount} personnes). Montant total: ${newBooking.totalAmount} TND.`,
  });

  return newBooking;
}

export async function updateBookingStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'): Promise<BookingRequest | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
      if (!error && data) {
        const idx = localBookings.findIndex(item => item.id === id);
        if (idx >= 0) localBookings[idx] = data as BookingRequest;
        savePersistedBookings(localBookings);
        return data as BookingRequest;
      }
    } catch (e) {
      console.warn('Supabase booking update failed:', e);
    }
  }

  const b = localBookings.find(item => item.id === id);
  if (b) {
    b.status = status;
    savePersistedBookings(localBookings);
    return { ...b };
  }
  return null;
}

// Leads / CRM
export async function getLeads(): Promise<Lead[]> {
  const freshLeads = loadPersistedLeads();
  if (freshLeads.length > 0) localLeads = freshLeads;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const supaLeads = data.map(normalizeLead);
        const map = new Map<string, Lead>();
        localLeads.forEach(l => map.set(l.id, l));
        supaLeads.forEach(l => { if (!map.has(l.id)) map.set(l.id, l); });
        const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localLeads = merged;
        savePersistedLeads(localLeads);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase fetch leads failed:', e);
    }
  }
  return [...localLeads];
}

export async function createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> {
  const newLead: Lead = {
    ...leadData,
    id: `lead-${Date.now()}`,
    status: 'Nouveau',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = toSupabaseLeadPayload(newLead);
      const { data, error } = await supabase.from('leads').insert([payload]).select().single();
      if (!error && data) {
        const normalized = normalizeLead(data);
        localLeads.unshift(normalized);
        savePersistedLeads(localLeads);
        return normalized;
      }
    } catch (e) {
      console.warn('Supabase insert lead failed:', e);
    }
  }

  localLeads.unshift(newLead);
  savePersistedLeads(localLeads);
  return newLead;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single();
      if (!error && data) {
        const idx = localLeads.findIndex(l => l.id === id);
        if (idx >= 0) localLeads[idx] = data as Lead;
        savePersistedLeads(localLeads);
        return data as Lead;
      }
    } catch (e) {
      console.warn('Supabase lead update failed:', e);
    }
  }

  const lead = localLeads.find(l => l.id === id);
  if (lead) {
    Object.assign(lead, updates);
    savePersistedLeads(localLeads);
    return { ...lead };
  }
  return null;
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<Lead | null> {
  return updateLead(id, { status });
}

export async function deleteLead(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('leads').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase lead delete failed:', e);
    }
  }
  localLeads = localLeads.filter(l => l.id !== id);
  savePersistedLeads(localLeads);
  return true;
}

// Owner Submissions ("Proposer un bien")
const SAMPLE_DEMO_SUBMISSION: OwnerSubmission = {
  id: 'sub-demo-01',
  refCode: 'DOS-2026-8850',
  propertyType: 'Villa',
  objective: 'VENTE',
  surfaceM2: 450,
  bedrooms: 4,
  estimatedValue: 1200000,
  estimatedPrice: 1200000,
  city: 'Sfax',
  district: 'Route de Téniour Km 3',
  gouvernorat: 'Sfax',
  address: 'Route de Téniour Km 3, Sfax',
  ownerName: 'Amine Triki',
  ownerPhone: '+216 20 111 222',
  ownerEmail: 'amine.triki@example.tn',
  titleType: 'Titre Bleu Individuel (رسم عقاري فردي)',
  titleNumber: '14859 Sfax',
  hasCertificate: '1',
  hasBuildingPermit: 'Permis de bâtir municipal en règle',
  tunisianLawCertified: true,
  details: 'Superbe villa de maître avec jardin arboré et piscine privative.',
  specificDetails: { bathrooms: 3, parkingSpots: 2, hasPool: true, hasGarden: true },
  photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
  status: 'PENDING',
  isPublished: false,
  createdAt: new Date().toISOString(),
};

export async function getOwnerSubmissions(): Promise<OwnerSubmission[]> {
  const freshSubs = loadPersistedSubmissions();
  if (freshSubs.length > 0) localSubmissions = freshSubs;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const supaSubs = data.map(normalizeSubmission);
        const map = new Map<string, OwnerSubmission>();
        localSubmissions.forEach(s => map.set(s.id, s));
        supaSubs.forEach(s => { if (!map.has(s.id)) map.set(s.id, s); });
        const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localSubmissions = merged;
        savePersistedSubmissions(localSubmissions);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase fetch submissions failed:', e);
    }
  }
  if (localSubmissions.length === 0) {
    localSubmissions = [SAMPLE_DEMO_SUBMISSION];
  }
  return [...localSubmissions];
}

export async function updateOwnerSubmissionStatus(id: string, status: OwnerSubmission['status'], isPublished?: boolean): Promise<OwnerSubmission | null> {
  const updatePayload: Record<string, any> = { status };
  if (isPublished !== undefined) {
    updatePayload.isPublished = isPublished;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('submissions').update(updatePayload).eq('id', id);
    } catch (e) {
      console.warn('Supabase update submission status failed:', e);
    }
  }

  const sub = localSubmissions.find(s => s.id === id || s.refCode === id);
  if (sub) {
    sub.status = status;
    if (isPublished !== undefined) {
      sub.isPublished = isPublished;
    }
    savePersistedSubmissions(localSubmissions);
    return { ...sub };
  }
  return null;
}

export async function createOwnerSubmission(submission: Omit<OwnerSubmission, 'id' | 'createdAt' | 'status'> & { refCode?: string }): Promise<{ submission: OwnerSubmission; whatsappLink: string }> {
  const refCode = submission.refCode || `DOS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newSubmission: OwnerSubmission = {
    ...submission,
    id: `prop-sub-${Date.now()}`,
    refCode,
    estimatedPrice: submission.estimatedPrice || submission.estimatedValue,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('submissions').insert([toSupabaseSubmissionPayload(newSubmission)]);
    } catch (e) {
      console.warn('Supabase owner submission failed:', e);
    }
  }

  localSubmissions.unshift(newSubmission);
  savePersistedSubmissions(localSubmissions);

  // Automatically record as CRM Lead
  await createLead({
    name: submission.ownerName,
    email: submission.ownerEmail,
    phone: submission.ownerPhone,
    source: 'Soumission Propriétaire',
    universe: submission.objective,
    propertyTitle: `Bien proposé: ${submission.propertyType} à ${submission.district}, ${submission.city} (${refCode})`,
    notes: `Surface: ${submission.surfaceM2}m². Valeur: ${submission.estimatedValue ? submission.estimatedValue + ' TND' : 'Non précisée'}. Titre: ${submission.titleType || 'Non spécifié'} (${submission.titleNumber || 'S/O'}). Détails: ${submission.details || 'Aucun'}`,
  });

  // Generate WhatsApp formatted text message for instant broker connection
  const text = encodeURIComponent(
    `Bonjour Villa Regia,\n\nJe viens de soumettre mon bien sur votre plateforme (${refCode}):\n` +
    `• Type: ${submission.propertyType}\n` +
    `• Univers ciblé: ${submission.objective}\n` +
    `• Localisation: ${submission.district}, ${submission.city} (${submission.gouvernorat || 'Sfax'})\n` +
    `• Surface: ${submission.surfaceM2} m²\n` +
    (submission.estimatedValue ? `• Estimation: ${submission.estimatedValue.toLocaleString('fr-FR')} TND\n` : '') +
    (submission.titleType ? `• Statut Juridique: ${submission.titleType}\n` : '') +
    `• Propriétaire: ${submission.ownerName} (${submission.ownerPhone})\n\n` +
    `Merci de me contacter pour convenir d'un rendez-vous d'évaluation et de validation.`
  );

  const whatsappLink = `https://wa.me/21627745403?text=${text}`;

  return { submission: newSubmission, whatsappLink };
}

// Dashboard statistics
export async function getAdminStats() {
  const properties = await getProperties();
  const bookings = await getBookings();
  const leads = await getLeads();

  const totalVolume = properties.reduce((sum, p) => sum + (p?.price?.amount || 0), 0);
  const activeCount = properties.filter(p => p?.status === 'DISPONIBLE').length;
  const pendingBookings = bookings.filter(b => b?.status === 'PENDING').length;
  const newLeadsCount = leads.filter(l => l?.status === 'Nouveau').length;

  return {
    totalProperties: properties.length,
    activeProperties: activeCount,
    totalBookings: bookings.length,
    pendingBookings,
    totalLeads: leads.length,
    newLeads: newLeadsCount,
    portfolioValueTND: totalVolume,
  };
}

// ----------------------------------------------------------------------------
// USER ACCOUNTS PERSISTENCE (DATABASE / SUPABASE & ACCOUNTS_STORE SYNCHRONIZATION)
// ----------------------------------------------------------------------------

export async function getDbUsers(): Promise<StoredUserAccount[]> {
  const freshPersisted = loadPersistedUsers();
  if (freshPersisted.length > 0) {
    localUsers = freshPersisted;
    freshPersisted.forEach(u => ACCOUNTS_STORE.set(u.email.toLowerCase().trim(), u));
  }

  if (!localUsers.some(u => u.email.toLowerCase() === DEFAULT_SUPERADMIN.email)) {
    localUsers.unshift(DEFAULT_SUPERADMIN);
    ACCOUNTS_STORE.set(DEFAULT_SUPERADMIN.email, DEFAULT_SUPERADMIN);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data && data.length > 0) {
        const supaUsers = data.map(normalizeUser);
        const map = new Map<string, StoredUserAccount>();
        localUsers.forEach(u => map.set(u.email.toLowerCase().trim(), u));
        supaUsers.forEach(u => {
          if (!map.has(u.email.toLowerCase().trim())) map.set(u.email.toLowerCase().trim(), u);
        });
        localUsers = Array.from(map.values());
        localUsers.forEach(u => ACCOUNTS_STORE.set(u.email.toLowerCase().trim(), u));
        savePersistedUsers(localUsers);
        return localUsers;
      }
    } catch (e) {
      console.warn('Supabase fetch users failed:', e);
    }
  }

  return [...localUsers];
}

export async function getDbUserByEmail(email: string): Promise<StoredUserAccount | null> {
  const cleanEmail = email.toLowerCase().trim();

  // Check ACCOUNTS_STORE first for instant retrieval
  const memUser = ACCOUNTS_STORE.get(cleanEmail);
  if (memUser) return memUser;

  // Check localUsers
  const localUser = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (localUser) {
    ACCOUNTS_STORE.set(cleanEmail, localUser);
    return localUser;
  }

  // Reload from disk if not found in memory (in case saved by another thread or cold start)
  const freshPersisted = loadPersistedUsers();
  const diskUser = freshPersisted.find(u => u.email.toLowerCase() === cleanEmail);
  if (diskUser) {
    localUsers = freshPersisted;
    ACCOUNTS_STORE.set(cleanEmail, diskUser);
    return diskUser;
  }

  // Check Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', cleanEmail).single();
      if (!error && data) {
        ACCOUNTS_STORE.set(cleanEmail, data as StoredUserAccount);
        return data as StoredUserAccount;
      }
    } catch (e) {
      console.warn('Supabase fetch user by email failed:', e);
    }
  }

  return null;
}

export async function createDbUser(userData: Omit<StoredUserAccount, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<StoredUserAccount> {
  const cleanEmail = userData.email.toLowerCase().trim();

  const newUser: StoredUserAccount = {
    ...userData,
    id: userData.id || `usr-${Date.now()}`,
    email: cleanEmail,
    createdAt: userData.createdAt || new Date().toISOString().split('T')[0],
  };

  // 1. Sync in memory Map
  ACCOUNTS_STORE.set(cleanEmail, newUser);

  // 2. Sync in localUsers array
  const existingIdx = localUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (existingIdx >= 0) {
    localUsers[existingIdx] = newUser;
  } else {
    localUsers.unshift(newUser);
  }

  // 3. Persist in Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('users').upsert([toSupabaseUserPayload(newUser)], { onConflict: 'email' });
    } catch (e) {
      console.warn('Supabase user insert/upsert failed:', e);
    }
  }

  // 4. Persist to disk JSON storage
  savePersistedUsers(localUsers);

  return newUser;
}

export async function updateDbUser(updateData: Partial<StoredUserAccount> & { email: string; id?: string }): Promise<StoredUserAccount | null> {
  const cleanEmail = updateData.email.toLowerCase().trim();

  let targetUser = await getDbUserByEmail(cleanEmail);
  if (!targetUser && updateData.id) {
    targetUser = localUsers.find(u => u.id === updateData.id) || null;
  }

  if (!targetUser) return null;

  const updatedUser: StoredUserAccount = {
    ...targetUser,
    ...updateData,
    email: cleanEmail,
  };

  // Sync Memory
  ACCOUNTS_STORE.set(cleanEmail, updatedUser);

  // Sync Array
  const idx = localUsers.findIndex(u => u.email.toLowerCase() === cleanEmail || (updateData.id && u.id === updateData.id));
  if (idx >= 0) {
    localUsers[idx] = updatedUser;
  } else {
    localUsers.push(updatedUser);
  }

  // Sync Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('users').update(updatedUser).eq('email', cleanEmail);
    } catch (e) {
      console.warn('Supabase user update failed:', e);
    }
  }

  // Persist to disk JSON storage
  savePersistedUsers(localUsers);

  return updatedUser;
}

export async function deleteDbUser(email?: string, id?: string): Promise<boolean> {
  let cleanEmail = email ? email.toLowerCase().trim() : '';

  if (!cleanEmail && id) {
    const user = localUsers.find(u => u.id === id);
    if (user) cleanEmail = user.email.toLowerCase().trim();
  }

  if (!cleanEmail && !id) return false;

  // Remove from ACCOUNTS_STORE
  if (cleanEmail) {
    ACCOUNTS_STORE.delete(cleanEmail);
  }

  // Remove from localUsers
  localUsers = localUsers.filter(u => {
    if (cleanEmail && u.email.toLowerCase() === cleanEmail) return false;
    if (id && u.id === id) return false;
    return true;
  });

  // Remove from Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      if (cleanEmail) {
        await supabase.from('users').delete().eq('email', cleanEmail);
      } else if (id) {
        await supabase.from('users').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase user delete failed:', e);
    }
  }

  // Persist to disk JSON storage
  savePersistedUsers(localUsers);

  return true;
}

// ----------------------------------------------------------------------------
// BLOG & JOURNAL ARTICLES PERSISTENCE (DATABASE / SUPABASE & LOCAL ARTICLES)
// ----------------------------------------------------------------------------

export async function getArticles(category?: string): Promise<BlogPost[]> {
  const freshArticles = loadPersistedArticles();
  if (freshArticles.length > 0) localArticles = freshArticles;
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('articles').select('*').order('publishedAt', { ascending: false });
      if (category && category !== 'ALL') {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as BlogPost[];
      }
    } catch (e) {
      console.warn('Supabase fetch articles failed, fallback to memory state:', e);
    }
  }

  if (category && category !== 'ALL') {
    return localArticles.filter(a => a.category === category);
  }
  return [...localArticles];
}

export async function getArticleBySlug(slug: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).single();
      if (!error && data) return data as BlogPost;
    } catch (e) {
      console.warn('Supabase fetch article by slug failed:', e);
    }
  }

  return localArticles.find(a => a.slug === slug) || null;
}

export async function createArticle(articleData: Omit<BlogPost, 'id'> & { id?: string }): Promise<BlogPost> {
  const newArticle: BlogPost = {
    ...articleData,
    id: articleData.id || `art-${Date.now()}`,
    slug: articleData.slug || `art-${Date.now()}`,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('articles').insert([newArticle]).select().single();
      if (!error && data) {
        localArticles.unshift(data as BlogPost);
        return data as BlogPost;
      }
    } catch (e) {
      console.warn('Supabase insert article failed:', e);
    }
  }

  localArticles.unshift(newArticle);
  savePersistedArticles(localArticles);
  return newArticle;
}

export async function updateArticle(id: string, updateData: Partial<BlogPost>): Promise<BlogPost | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('articles').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        const idx = localArticles.findIndex(a => a.id === id);
        if (idx >= 0) localArticles[idx] = data as BlogPost;
        savePersistedArticles(localArticles);
        return data as BlogPost;
      }
    } catch (e) {
      console.warn('Supabase update article failed:', e);
    }
  }

  const idx = localArticles.findIndex(a => a.id === id);
  if (idx >= 0) {
    localArticles[idx] = { ...localArticles[idx], ...updateData };
    savePersistedArticles(localArticles);
    return localArticles[idx];
  }

  return null;
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('articles').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete article failed:', e);
    }
  }

  localArticles = localArticles.filter(a => a.id !== id);
  savePersistedArticles(localArticles);
  return true;
}

