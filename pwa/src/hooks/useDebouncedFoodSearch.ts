import { useEffect, useRef, useState } from 'react';
import { api, type FoodSearchResult } from '../lib/api';

export function useDebouncedFoodSearch(foodName: string, minLength = 2, delayMs = 250) {
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!foodName.trim() || foodName.length < minLength) {
      setSearchResults([]);
      return;
    }
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      void api.searchFood(foodName.trim()).then((r) => setSearchResults(r.results)).catch(() => setSearchResults([]));
    }, delayMs);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [foodName, minLength, delayMs]);

  return { searchResults, setSearchResults };
}
