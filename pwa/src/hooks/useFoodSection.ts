import { useFoodSectionActions } from './useFoodSectionActions';
import { useFoodSectionData } from './useFoodSectionData';
import { useFoodSectionFormState } from './useFoodSectionFormState';

export function useFoodSection(serverOnline: boolean) {
  const data = useFoodSectionData(serverOnline);
  const form = useFoodSectionFormState();
  const actions = useFoodSectionActions(form, data);

  return {
    data: data.data,
    error: data.error,
    success: data.success,
    loading: data.loading,
    description: form.description,
    setDescription: form.setDescription,
    mealType: form.mealType,
    setMealType: form.setMealType,
    foodName: form.foodName,
    setFoodName: form.setFoodName,
    quantity: form.quantity,
    setQuantity: form.setQuantity,
    searchResults: form.searchResults,
    editingRow: form.editingRow,
    editQty: form.editQty,
    setEditQty: form.setEditQty,
    ...actions,
  };
}
