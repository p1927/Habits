export interface MealPhoto {
  id: string;
  dataUrl: string;
  label: string;
  at: string;
}

const STORAGE_KEY = 'habits-meal-photos';
const MAX_PHOTOS = 24;
const MAX_AGE_DAYS = 7;

function readAll(): MealPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MealPhoto[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: MealPhoto[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function prune(items: MealPhoto[]): MealPhoto[] {
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  return items
    .filter((p) => new Date(p.at).getTime() >= cutoff)
    .slice(0, MAX_PHOTOS);
}

export function addMealPhoto(dataUrl: string, label: string): MealPhoto {
  const photo: MealPhoto = {
    id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dataUrl,
    label: label.trim() || 'Meal',
    at: new Date().toISOString(),
  };
  const next = prune([photo, ...readAll()]);
  writeAll(next);
  return photo;
}

export function getTodayMealPhotos(): MealPhoto[] {
  const today = new Date().toISOString().slice(0, 10);
  return prune(readAll()).filter((p) => p.at.slice(0, 10) === today);
}

export function getRecentMealPhotos(limit = 12): MealPhoto[] {
  return prune(readAll()).slice(0, limit);
}

export function getMealPhotoById(id: string): MealPhoto | null {
  return prune(readAll()).find((p) => p.id === id) ?? null;
}
