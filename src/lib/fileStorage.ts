import fs from 'fs';
import path from 'path';
import { StoredUserAccount } from './authStore';

const LOCAL_DATA_DIR = path.join(process.cwd(), 'src', 'data');
const USERS_FILE = path.join(LOCAL_DATA_DIR, 'db_users.json');
const TMP_USERS_FILE = path.join('/tmp', 'villaregia_users.json');

function getActiveUsersFilePath(): string {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    return USERS_FILE;
  } catch {
    return TMP_USERS_FILE;
  }
}

export function loadPersistedUsers(): StoredUserAccount[] {
  const filePath = getActiveUsersFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read persisted users file, using memory fallback:', err);
  }

  // Fallback to /tmp if primary failed
  try {
    if (filePath !== TMP_USERS_FILE && fs.existsSync(TMP_USERS_FILE)) {
      const content = fs.readFileSync(TMP_USERS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return [];
}

export function savePersistedUsers(users: StoredUserAccount[]): void {
  const filePath = getActiveUsersFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    // Try /tmp fallback for read-only environments
    try {
      fs.writeFileSync(TMP_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (tmpErr) {
      console.warn('Could not write users to disk:', tmpErr);
    }
  }
}
