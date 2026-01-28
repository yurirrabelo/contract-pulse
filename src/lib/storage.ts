// LocalStorage persistence utilities

const STORAGE_PREFIX = 'contract_manager_';
const SCHEMA_VERSION_KEY = 'contract_manager_schema_version';
const CURRENT_SCHEMA_VERSION = 3; // Increment when schema changes

export function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

// Check and migrate schema version
function checkSchemaVersion(): void {
  try {
    const storedVersion = localStorage.getItem(SCHEMA_VERSION_KEY);
    const currentVersion = parseInt(storedVersion || '0', 10);
    
    if (currentVersion < CURRENT_SCHEMA_VERSION) {
      // Clear old data when schema changes
      clearAllStorage();
      localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION.toString());
      console.log('Schema updated, data reset to defaults');
    }
  } catch (error) {
    console.error('Failed to check schema version:', error);
  }
}

// Initialize schema check on module load
checkSchemaVersion();

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(getStorageKey(key));
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(getStorageKey(key));
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
}

export function clearAllStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Date utilities
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getDaysUntil(date: string): number {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getContractStatus(endDate: string): 'active' | 'expiring_30' | 'expiring_60' | 'expiring_90' | 'expired' {
  const days = getDaysUntil(endDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring_30';
  if (days <= 60) return 'expiring_60';
  if (days <= 90) return 'expiring_90';
  return 'active';
}
