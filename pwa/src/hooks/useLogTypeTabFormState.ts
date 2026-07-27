import { useState } from 'react';
import type { OffProduct } from '../lib/openFoodFacts';
import { useDebouncedFoodSearch } from './useDebouncedFoodSearch';

export function useLogTypeTabFormState() {
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('other');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [offProduct, setOffProduct] = useState<OffProduct | null>(null);
  const [offQuantity, setOffQuantity] = useState('100');
  const { searchResults, setSearchResults } = useDebouncedFoodSearch(foodName);

  return {
    description,
    setDescription,
    mealType,
    setMealType,
    foodName,
    setFoodName,
    quantity,
    setQuantity,
    offProduct,
    setOffProduct,
    offQuantity,
    setOffQuantity,
    searchResults,
    setSearchResults,
  };
}

export type LogTypeTabFormState = ReturnType<typeof useLogTypeTabFormState>;
