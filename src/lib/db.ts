import { Property, BookingRequest, Lead, OwnerSubmission, FilterState, EventQuoteRequest, BlogPost } from '@/types';
import { INITIAL_PROPERTIES, INITIAL_ARTICLES } from '@/data/properties';
import { supabase, isSupabaseConfigured } from './supabase';

import { ACCOUNTS_STORE, StoredUserAccount } from './authStore';

// In-Memory Fallback State (persists during server runtime, syncs with browser localStorage on client)
let localProperties: Property[] = [...INITIAL_PROPERTIES];

let localArticles: BlogPost[] = [...INITIAL_ARTICLES];

let localBookings: BookingRequest[] = [];

let localLeads: Lead[] = [];

let localSubmissions: OwnerSubmission[] = [];

let localUsers: StoredUserAccount[] = [
  {
    id: 'user-superadmin-01',
    name: 'Yassine Aloulou (Directeur Général)',
    email: 'yassinealoulou6@gmail.com',
    phone: '+216 98 000 000',
    password: 'Yassine.123',
    role: 'SUPER_ADMIN',
    twoFactorEnabled: false,
    emailVerified: true,
    createdAt: '2026-09-02',
  },
];

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
export async function getOwnerSubmissions(): Promise<OwnerSubmission[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as OwnerSubmission[];
      }
    } catch (e) {
      console.warn('Supabase fetch submissions failed:', e);
    }
  }
  return [...localSubmissions];
}

export async function updateOwnerSubmissionStatus(id: string, status: OwnerSubmission['status']): Promise<OwnerSubmission | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('submissions').update({ status }).eq('id', id);
    } catch (e) {
      console.warn('Supabase update submission status failed:', e);
    }
  }

  const sub = localSubmissions.find(s => s.id === id || s.refCode === id);
  if (sub) {
    sub.status = status;
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

  const whatsappLink = `https://wa.me/21627745405?text=${text}`;

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

// ----------------------------------------------------------------------------
// USER ACCOUNTS PERSISTENCE (DATABASE / SUPABASE & ACCOUNTS_STORE SYNCHRONIZATION)
// ----------------------------------------------------------------------------

export async function getDbUsers(): Promise<StoredUserAccount[]> {
  // Sync in-memory map accounts into localUsers list
  ACCOUNTS_STORE.forEach((acc) => {
    const existing = localUsers.find(u => u.email.toLowerCase() === acc.email.toLowerCase());
    if (!existing) {
      localUsers.push(acc);
    } else {
      Object.assign(existing, acc);
    }
  });

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) {
        // Sync Supabase users into ACCOUNTS_STORE
        data.forEach((u: StoredUserAccount) => {
          ACCOUNTS_STORE.set(u.email.toLowerCase(), u);
          const idx = localUsers.findIndex(item => item.email.toLowerCase() === u.email.toLowerCase());
          if (idx >= 0) {
            localUsers[idx] = u;
          } else {
            localUsers.push(u);
          }
        });
        return localUsers;
      }
    } catch (e) {
      console.warn('Supabase fetch users failed, fallback to memory store:', e);
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
      await supabase.from('users').upsert([newUser], { onConflict: 'email' });
    } catch (e) {
      console.warn('Supabase user insert/upsert failed:', e);
    }
  }

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

  return true;
}

// ----------------------------------------------------------------------------
// BLOG & JOURNAL ARTICLES PERSISTENCE (DATABASE / SUPABASE & LOCAL ARTICLES)
// ----------------------------------------------------------------------------

export async function getArticles(category?: string): Promise<BlogPost[]> {
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
  return newArticle;
}

export async function updateArticle(id: string, updateData: Partial<BlogPost>): Promise<BlogPost | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('articles').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        const idx = localArticles.findIndex(a => a.id === id);
        if (idx >= 0) localArticles[idx] = data as BlogPost;
        return data as BlogPost;
      }
    } catch (e) {
      console.warn('Supabase update article failed:', e);
    }
  }

  const idx = localArticles.findIndex(a => a.id === id);
  if (idx >= 0) {
    localArticles[idx] = { ...localArticles[idx], ...updateData };
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
  return true;
}

