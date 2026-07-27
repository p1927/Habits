import { useState } from 'react';
import { useDebouncedFoodSearch } from './useDebouncedFoodSearch';

export function useFoodSectionFormState() {
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('other');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');
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
    searchResults,
    setSearchResults,
    editingRow,
    setEditingRow,
    editQty,
    setEditQty,
  };
}

export type FoodSectionFormState = ReturnType<typeof useFoodSectionFormState>;
