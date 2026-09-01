import { Property, BookingRequest, Lead, OwnerSubmission, FilterState, EventQuoteRequest } from '@/types';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { supabase, isSupabaseConfigured } from './supabase';

// In-Memory Fallback State (persists during server runtime, syncs with browser localStorage on client)
let localProperties: Property[] = [...INITIAL_PROPERTIES];

let localBookings: BookingRequest[] = [
  {
    id: 'res-101',
    propertyId: 'vr-soukra-01',
    propertyTitle: 'Domaine de la Soukra — Villa de Maître & Piscine Oliviers',
    guestName: 'Kamel Triki',
    guestEmail: 'k.triki@business.tn',
    guestPhone: '+216 98 123 456',
    checkIn: '2026-09-10',
    checkOut: '2026-09-15',
    guestsCount: 6,
    totalNights: 5,
    pricePerNight: 1450,
    totalAmount: 7250,
    depositAmount: 2175,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-102',
    propertyId: 'vr-gremda-02',
    propertyTitle: 'Palais de l\'Altesse — Domaine Événementiel Route de Gremda',
    guestName: 'Sonia Ben Ammar',
    guestEmail: 'sonia.ba@gmail.com',
    guestPhone: '+216 22 987 654',
    checkIn: '2026-10-02',
    checkOut: '2026-10-04',
    guestsCount: 250,
    totalNights: 2,
    pricePerNight: 3500,
    totalAmount: 7000,
    depositAmount: 2100,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

let localLeads: Lead[] = [
  {
    id: 'lead-01',
    name: 'Mohamed Charfi',
    email: 'm.charfi@sfax-export.com',
    phone: '+216 98 444 555',
    source: 'Formulaire Contact',
    universe: 'VENTE',
    propertyTitle: 'Résidence L’Olivier d’Or — Villa Contemporaine Route de Téniour',
    status: 'Visite',
    notes: 'Client sérieux cherche villa de maître pour résidence principale à Téniour. Visite programmée ce samedi.',
    assignedAgent: 'Yassine Karray',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'lead-02',
    name: 'Madame Meriam Louati',
    email: 'meriam.louati@health.tn',
    phone: '+216 24 111 222',
    source: 'Soumission Propriétaire',
    universe: 'LUXE',
    propertyTitle: 'Propriété de Charme Route de Saltania',
    status: 'Nouveau',
    notes: 'A soumis un bien à la location courte durée. Surface 450m2 avec jardin.',
    assignedAgent: 'Sofia Mezghani',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'lead-03',
    name: 'Karim Fakhfakh',
    email: 'kfakhfakh@tech-innov.tn',
    phone: '+216 55 777 888',
    source: 'WhatsApp',
    universe: 'EVENT',
    propertyTitle: 'Palais de l\'Altesse — Domaine Événementiel Route de Gremda',
    status: 'Offre',
    notes: 'Souhaite privatiser le domaine pour séminaire d\'entreprise (150 personnes). Devis transmis.',
    assignedAgent: 'Yassine Karray',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

let localSubmissions: OwnerSubmission[] = [];

// Helper functions for properties
export async function getProperties(filters?: Partial<FilterState>): Promise<Property[]> {
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
      result = result.filter(p => p.price.amount >= minP);
    }
    if (filters.maxPrice && filters.maxPrice > 0) {
      const maxP = filters.maxPrice;
      result = result.filter(p => p.price.amount <= maxP);
    }
    if (filters.minBedrooms && filters.minBedrooms > 0) {
      const minB = filters.minBedrooms;
      result = result.filter(p => (p.specs.bedrooms || 0) >= minB);
    }
    if (filters.minSurface && filters.minSurface > 0) {
      const minS = filters.minSurface;
      result = result.filter(p => p.specs.surfaceM2 >= minS);
    }
    if (filters.hasPool) {
      result = result.filter(p => p.specs.pool === true);
    }
    if (filters.hasGarden) {
      result = result.filter(p => p.specs.garden === true);
    }
    if (filters.isConstructible) {
      result = result.filter(p => p.specs.constructible === true);
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
      if (!error && data) return data as Property;
    } catch (e) {
      console.warn('Supabase insert property failed:', e);
    }
  }

  localProperties.unshift(newProperty);
  return newProperty;
}

export async function updatePropertyStatus(id: string, status: Property['status']): Promise<Property | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('properties').update({ status }).eq('id', id).select().single();
      if (!error && data) return data as Property;
    } catch (e) {
      console.warn('Supabase update status failed:', e);
    }
  }

  const prop = localProperties.find(p => p.id === id);
  if (prop) {
    prop.status = status;
    prop.updatedAt = new Date().toISOString();
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
  return true;
}

// Bookings
export async function getBookings(): Promise<BookingRequest[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) return data as BookingRequest[];
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
      const { data, error } = await supabase.from('bookings').insert([newBooking]).select().single();
      if (!error && data) return data as BookingRequest;
    } catch (e) {
      console.warn('Supabase insert booking failed:', e);
    }
  }

  localBookings.unshift(newBooking);
  
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
      if (!error && data) return data as BookingRequest;
    } catch (e) {
      console.warn('Supabase booking update failed:', e);
    }
  }

  const b = localBookings.find(item => item.id === id);
  if (b) {
    b.status = status;
    return { ...b };
  }
  return null;
}

// Leads / CRM
export async function getLeads(): Promise<Lead[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) return data as Lead[];
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
      const { data, error } = await supabase.from('leads').insert([newLead]).select().single();
      if (!error && data) return data as Lead;
    } catch (e) {
      console.warn('Supabase insert lead failed:', e);
    }
  }

  localLeads.unshift(newLead);
  return newLead;
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<Lead | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('leads').update({ status }).eq('id', id).select().single();
      if (!error && data) return data as Lead;
    } catch (e) {
      console.warn('Supabase lead status update failed:', e);
    }
  }

  const lead = localLeads.find(l => l.id === id);
  if (lead) {
    lead.status = status;
    return { ...lead };
  }
  return null;
}

// Owner Submissions ("Proposer un bien")
export async function createOwnerSubmission(submission: Omit<OwnerSubmission, 'id' | 'createdAt' | 'status'>): Promise<{ submission: OwnerSubmission; whatsappLink: string }> {
  const newSubmission: OwnerSubmission = {
    ...submission,
    id: `prop-sub-${Date.now()}`,
    status: 'NOUVEAU',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('submissions').insert([newSubmission]);
    } catch (e) {
      console.warn('Supabase owner submission failed:', e);
    }
  }

  localSubmissions.unshift(newSubmission);

  // Automatically record as CRM Lead
  await createLead({
    name: submission.ownerName,
    email: submission.ownerEmail,
    phone: submission.ownerPhone,
    source: 'Soumission Propriétaire',
    universe: submission.objective,
    propertyTitle: `Bien proposé: ${submission.propertyType} à ${submission.district}, ${submission.city}`,
    notes: `Surface: ${submission.surfaceM2}m². Valeur estimée: ${submission.estimatedValue ? submission.estimatedValue + ' TND' : 'Non précisée'}. Détails: ${submission.details || 'Aucun'}`,
  });

  // Generate WhatsApp formatted text message for instant broker connection
  const text = encodeURIComponent(
    `Bonjour Villa Regia,\n\nJe souhaite vous confier la gestion / vente de mon bien d'exception:\n` +
    `• Type: ${submission.propertyType}\n` +
    `• Univers ciblé: ${submission.objective}\n` +
    `• Localisation: ${submission.district}, ${submission.city}\n` +
    `• Surface: ${submission.surfaceM2} m²\n` +
    (submission.estimatedValue ? `• Estimation: ${submission.estimatedValue.toLocaleString('fr-FR')} TND\n` : '') +
    `• Propriétaire: ${submission.ownerName} (${submission.ownerPhone})\n\n` +
    `Merci de me contacter pour convenir d'un rendez-vous d'évaluation confidentiel.`
  );

  const whatsappLink = `https://wa.me/21698123456?text=${text}`;

  return { submission: newSubmission, whatsappLink };
}

// Dashboard statistics
export async function getAdminStats() {
  const properties = await getProperties();
  const bookings = await getBookings();
  const leads = await getLeads();

  const totalVolume = properties.reduce((sum, p) => sum + p.price.amount, 0);
  const activeCount = properties.filter(p => p.status === 'DISPONIBLE').length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const newLeadsCount = leads.filter(l => l.status === 'Nouveau').length;

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
