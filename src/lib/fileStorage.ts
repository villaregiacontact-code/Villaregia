import fs from 'fs';
import path from 'path';
import { StoredUserAccount } from './authStore';
import { Property, BookingRequest, Lead, OwnerSubmission, BlogPost } from '@/types';
import { INITIAL_PROPERTIES, INITIAL_ARTICLES } from '@/data/properties';

const LOCAL_DATA_DIR = path.join(process.cwd(), 'src', 'data');

function getFilePath(filename: string): string {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    return path.join(LOCAL_DATA_DIR, filename);
  } catch {
    return path.join('/tmp', filename);
  }
}

function safeReadJson<T>(filename: string, fallback: T): T {
  const filePath = getFilePath(filename);
  const tmpPath = path.join('/tmp', filename);

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(fallback) ? Array.isArray(parsed) : parsed !== null) {
        return parsed as T;
      }
    }
  } catch (err) {
    console.warn(`Could not read ${filename}, checking /tmp:`, err);
  }

  try {
    if (fs.existsSync(tmpPath)) {
      const content = fs.readFileSync(tmpPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(fallback) ? Array.isArray(parsed) : parsed !== null) {
        return parsed as T;
      }
    }
  } catch {}

  return fallback;
}

function safeWriteJson<T>(filename: string, data: T): void {
  const filePath = getFilePath(filename);
  const tmpPath = path.join('/tmp', filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (tmpErr) {
      console.warn(`Could not write ${filename} to disk:`, tmpErr);
    }
  }
}

// ── USERS PERSISTENCE ──
export function loadPersistedUsers(): StoredUserAccount[] {
  return safeReadJson<StoredUserAccount[]>('db_users.json', []);
}

export function savePersistedUsers(users: StoredUserAccount[]): void {
  safeWriteJson('db_users.json', users);
}

// ── SUBMISSIONS PERSISTENCE ("Proposer un bien") ──
export function loadPersistedSubmissions(): OwnerSubmission[] {
  return safeReadJson<OwnerSubmission[]>('db_submissions.json', []);
}

export function savePersistedSubmissions(submissions: OwnerSubmission[]): void {
  safeWriteJson('db_submissions.json', submissions);
}

// ── LEADS PERSISTENCE (CRM) ──
export function loadPersistedLeads(): Lead[] {
  return safeReadJson<Lead[]>('db_leads.json', []);
}

export function savePersistedLeads(leads: Lead[]): void {
  safeWriteJson('db_leads.json', leads);
}

// ── BOOKINGS PERSISTENCE (Villas Luxe) ──
export function loadPersistedBookings(): BookingRequest[] {
  return safeReadJson<BookingRequest[]>('db_bookings.json', []);
}

export function savePersistedBookings(bookings: BookingRequest[]): void {
  safeWriteJson('db_bookings.json', bookings);
}

// ── PROPERTIES PERSISTENCE ──
export function loadPersistedProperties(): Property[] {
  const loaded = safeReadJson<Property[]>('db_properties.json', []);
  return loaded.length > 0 ? loaded : [...INITIAL_PROPERTIES];
}

export function savePersistedProperties(properties: Property[]): void {
  safeWriteJson('db_properties.json', properties);
}

// ── ARTICLES PERSISTENCE ──
export function loadPersistedArticles(): BlogPost[] {
  return safeReadJson<BlogPost[]>('db_articles.json', INITIAL_ARTICLES);
}

export function savePersistedArticles(articles: BlogPost[]): void {
  safeWriteJson('db_articles.json', articles);
}

export function loadPersistedPendingRegistrations(): Record<string, any> {
  return safeReadJson<Record<string, any>>('db_pending.json', {});
}

export function savePersistedPendingRegistrations(pendingMap: Record<string, any>): void {
  safeWriteJson('db_pending.json', pendingMap);
}
