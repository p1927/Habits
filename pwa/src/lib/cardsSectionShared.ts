export const CARDS_FILTERS = ['all', 'sickness', 'notes', 'strategy'] as const;

export const CARDS_SHORTCUT_HINT_KEY = 'habits-cards-shortcuts-hint-seen';

export type CardsFilter = (typeof CARDS_FILTERS)[number];

export const KEEP_CARD_VARIANTS: Record<string, 'keep-yellow' | 'keep-blue' | 'keep-green' | 'keep-pink' | 'keep-purple'> = {
  sickness: 'keep-yellow',
  notes: 'keep-blue',
  strategy: 'keep-green',
};

export function filterCardsBySearch<T extends { title: string; body: string }>(cards: T[], search: string): T[] {
  const q = search.toLowerCase();
  if (!q) return cards;
  return cards.filter((c) => c.title.toLowerCase().includes(q) || c.body.toLowerCase().includes(q));
}
