import { Property, OwnerSubmission, Lead, BookingRequest, BlogPost, UserAccount } from '@/types';

/**
 * Merge server properties with client-side localStorage properties
 */
export function getMergedProperties(serverList: Property[] = []): Property[] {
  if (typeof window === 'undefined') return serverList || [];
  try {
    const deletedRaw = localStorage.getItem('vr_admin_properties_deleted');
    const deletedSet = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

    const localRaw = localStorage.getItem('vr_admin_properties');
    const localList: Property[] = localRaw ? JSON.parse(localRaw) : [];

    const map = new Map<string, Property>();

    // 1. Load local properties (preserves local additions/edits)
    (localList || []).forEach((p) => {
      if (p && p.id && !deletedSet.has(p.id)) {
        map.set(p.id, p);
      }
    });

    // 2. Load server properties if not locally deleted or overridden
    (serverList || []).forEach((p) => {
      if (p && p.id && !deletedSet.has(p.id)) {
        if (!map.has(p.id)) {
          map.set(p.id, p);
        }
      }
    });

    const result = Array.from(map.values());
    try {
      localStorage.setItem('vr_admin_properties', JSON.stringify(result));
    } catch {}
    return result;
  } catch {
    return serverList || [];
  }
}

/**
 * Save property locally and update list
 */
export function saveLocalProperty(prop: Property): Property[] {
  if (typeof window === 'undefined') return [prop];
  try {
    const localRaw = localStorage.getItem('vr_admin_properties');
    const localList: Property[] = localRaw ? JSON.parse(localRaw) : [];
    const idx = localList.findIndex((p) => p.id === prop.id);
    if (idx >= 0) {
      localList[idx] = prop;
    } else {
      localList.unshift(prop);
    }
    localStorage.setItem('vr_admin_properties', JSON.stringify(localList));
    return localList;
  } catch {
    return [prop];
  }
}

/**
 * Remove property locally
 */
export function removeLocalProperty(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const deletedRaw = localStorage.getItem('vr_admin_properties_deleted');
    const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
    if (!deletedList.includes(id)) deletedList.push(id);
    localStorage.setItem('vr_admin_properties_deleted', JSON.stringify(deletedList));

    const localRaw = localStorage.getItem('vr_admin_properties');
    const localList: Property[] = localRaw ? JSON.parse(localRaw) : [];
    const filtered = localList.filter((p) => p.id !== id);
    localStorage.setItem('vr_admin_properties', JSON.stringify(filtered));
  } catch {}
}

/**
 * Export full admin database state as JSON backup
 */
export function exportAdminDatabaseJson(): void {
  if (typeof window === 'undefined') return;
  try {
    const props = JSON.parse(localStorage.getItem('vr_admin_properties') || '[]');
    const subs = JSON.parse(localStorage.getItem('vr_admin_submissions') || '[]');
    const leads = JSON.parse(localStorage.getItem('vr_admin_leads') || '[]');
    const res = JSON.parse(localStorage.getItem('vr_admin_bookings') || '[]');
    const articles = JSON.parse(localStorage.getItem('vr_admin_articles') || '[]');
    const users = JSON.parse(localStorage.getItem('vr_admin_users') || '[]');

    const backup = {
      exportDate: new Date().toISOString(),
      properties: props,
      submissions: subs,
      leads,
      bookings: res,
      articles,
      users,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `villaregia_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export error:', err);
  }
}

/**
 * Import full admin database JSON backup
 */
export function importAdminDatabaseJson(jsonData: any): boolean {
  if (typeof window === 'undefined' || !jsonData) return false;
  try {
    if (Array.isArray(jsonData.properties)) {
      localStorage.setItem('vr_admin_properties', JSON.stringify(jsonData.properties));
    }
    if (Array.isArray(jsonData.submissions)) {
      localStorage.setItem('vr_admin_submissions', JSON.stringify(jsonData.submissions));
    }
    if (Array.isArray(jsonData.leads)) {
      localStorage.setItem('vr_admin_leads', JSON.stringify(jsonData.leads));
    }
    if (Array.isArray(jsonData.bookings)) {
      localStorage.setItem('vr_admin_bookings', JSON.stringify(jsonData.bookings));
    }
    if (Array.isArray(jsonData.articles)) {
      localStorage.setItem('vr_admin_articles', JSON.stringify(jsonData.articles));
    }
    if (Array.isArray(jsonData.users)) {
      localStorage.setItem('vr_admin_users', JSON.stringify(jsonData.users));
    }
    return true;
  } catch (err) {
    console.error('Import error:', err);
    return false;
  }
}
