import { useCallback } from 'react';
import { api, type FoodLogItem } from '../lib/api';
import type { FoodSectionDataState } from './useFoodSectionData';
import type { FoodSectionFormState } from './useFoodSectionFormState';

export function useFoodSectionActions(
  form: FoodSectionFormState,
  { setData, setError, setSuccess, setLoading }: Pick<FoodSectionDataState, 'setData' | 'setError' | 'setSuccess' | 'setLoading'>,
) {
  const {
    description,
    mealType,
    foodName,
    quantity,
    editQty,
    setDescription,
    setFoodName,
    setSearchResults,
    setEditingRow,
    setEditQty,
  } = form;

  const handleVoiceLog = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!description.trim()) return;
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const res = await api.logFood(description.trim(), mealType);
        setData(res.summary);
        setDescription('');
        setSuccess(res.message);
        if (res.errors?.length) setError(res.errors.join('; '));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Log failed');
      } finally {
        setLoading(false);
      }
    },
    [description, mealType, setData, setDescription, setError, setLoading, setSuccess],
  );

  const handleManualLog = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const qty = Number.parseFloat(quantity);
      if (!foodName.trim() || !qty) return;
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const res = await api.logFoodItem(foodName.trim(), qty);
        setData(res.summary);
        setFoodName('');
        setSearchResults([]);
        setSuccess(res.message);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Log failed');
      } finally {
        setLoading(false);
      }
    },
    [quantity, foodName, setData, setFoodName, setSearchResults, setError, setLoading, setSuccess],
  );

  const handleDelete = useCallback(
    async (row: number) => {
      if (!window.confirm('Remove this entry?')) return;
      setLoading(true);
      try {
        setData(await api.deleteFoodRow(row));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed');
      } finally {
        setLoading(false);
      }
    },
    [setData, setError, setLoading],
  );

  const handleSaveEdit = useCallback(
    async (item: FoodLogItem) => {
      const qty = Number.parseFloat(editQty);
      if (!qty) return;
      setLoading(true);
      try {
        setData(await api.updateFoodRow(item.row, item.food, qty));
        setEditingRow(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Update failed');
      } finally {
        setLoading(false);
      }
    },
    [editQty, setData, setEditingRow, setError, setLoading],
  );

  const startEdit = useCallback(
    (item: FoodLogItem) => {
      setEditingRow(item.row);
      setEditQty(String(item.quantity_g));
    },
    [setEditQty, setEditingRow],
  );

  const selectSearchResult = useCallback(
    (name: string) => {
      setFoodName(name);
      setSearchResults([]);
    },
    [setFoodName, setSearchResults],
  );

  const cancelEdit = useCallback(() => setEditingRow(null), [setEditingRow]);

  return {
    handleVoiceLog,
    handleManualLog,
    handleDelete,
    handleSaveEdit,
    startEdit,
    cancelEdit,
    selectSearchResult,
  };
}
