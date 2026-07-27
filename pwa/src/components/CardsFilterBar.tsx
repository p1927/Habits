import { CARDS_FILTERS, type CardsFilter } from '../lib/cardsSectionShared';

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
}

export function CardsFilterBar({ search, filter, onSearchChange, onFilterChange }: CardsFilterBarProps) {
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
        {CARDS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`sub-tab cards-filter-tab ${FILTER_TAB_CLASS[f]} ${filter === f ? 'sub-tab-active' : ''}`.trim()}
            onClick={() => onFilterChange(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </>
  );
}
