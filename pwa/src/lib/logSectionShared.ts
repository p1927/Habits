export type LogTab = 'scan' | 'type' | 'mealplan' | 'recipes' | 'history';

export const LOG_TABS: LogTab[] = ['scan', 'type', 'mealplan', 'recipes', 'history'];
export const LOG_SHORTCUT_HINT_KEY = 'habits-log-shortcuts-hint-seen';

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'other', label: 'Other' },
] as const;

const LOG_TAB_LABELS: Record<LogTab, string> = {
  scan: 'Scan',
  type: 'Type',
  mealplan: 'Plan',
  recipes: 'Recipes',
  history: 'History',
};

export function logTabLabel(tab: LogTab): string {
  return LOG_TAB_LABELS[tab];
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function shortcutModifierLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl+';
  return /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘' : 'Ctrl+';
}

export function dataUrlToFile(dataUrl: string, name = 'scan.jpg'): File {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}
