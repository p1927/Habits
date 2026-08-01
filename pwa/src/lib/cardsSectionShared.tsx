import { Fragment, type ReactNode } from 'react';

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

/**
 * Splits text into alternating plain/marked spans around case-insensitive matches
 * of `query`. Returns React nodes suitable for inline rendering inside <h3>/<p>.
 * Returns the original string when `query` is empty.
 */
export function highlightSearchMatch(text: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const lower = text.toLowerCase();
  const needle = trimmed.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let index = lower.indexOf(needle, cursor);
  let key = 0;
  while (index !== -1) {
    if (index > cursor) parts.push(text.slice(cursor, index));
    parts.push(
      <mark key={`hl-${key++}`} className="cards-search-hit">
        {text.slice(index, index + needle.length)}
      </mark>,
    );
    cursor = index + needle.length;
    index = lower.indexOf(needle, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length === 0 ? text : <Fragment>{parts}</Fragment>;
}
