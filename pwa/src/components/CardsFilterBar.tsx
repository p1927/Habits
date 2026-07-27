import { CARDS_FILTERS, type CardsFilter } from '../lib/cardsSectionShared';
import { shortcutModifierLabel } from '../lib/logSectionShared';

const FILTER_TAB_CLASS: Record<CardsFilter, string> = {
  all: '',
  sickness: 'cards-filter-tab--sickness',
  notes: 'cards-filter-tab--notes',
  strategy: 'cards-filter-tab--strategy',
};

interface CardsFilterBarProps {
  search: string;
  filter: CardsFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: CardsFilter) => void;
  showShortcutHint: boolean;
  onDismissShortcutHint: () => void;
}

export function CardsFilterBar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
  showShortcutHint,
  onDismissShortcutHint,
}: CardsFilterBarProps) {
  const mod = shortcutModifierLabel();

  const selectFilter = (next: CardsFilter) => {
    onFilterChange(next);
    onDismissShortcutHint();
  };

  return (
    <>
      <label className="sr-only" htmlFor="cards-search">Search cards</label>
      <input
        id="cards-search"
        className="cards-search"
        placeholder="Search Keep"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="sub-tabs" role="tablist" aria-label="Card filters">
        {CARDS_FILTERS.map((f, index) => (
          <button
            key={f}
            type="button"
            role="tab"
            id={`cards-filter-${f}`}
            aria-controls="cards-filter-panel"
            aria-selected={filter === f}
            tabIndex={filter === f ? 0 : -1}
            aria-keyshortcuts={`${mod}${index + 1}`}
            className={`sub-tab cards-filter-tab ${FILTER_TAB_CLASS[f]} ${filter === f ? 'sub-tab-active' : ''}`.trim()}
            onClick={() => selectFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showShortcutHint && (
        <p className="log-shortcut-hint muted cards-filter-shortcut-hint" role="note">
          Tip: press <kbd>{mod}1</kbd>–<kbd>{mod}4</kbd> to switch filters.{' '}
          <button type="button" className="link-btn" onClick={onDismissShortcutHint}>
            Got it
          </button>
        </p>
      )}
    </>
  );
}
