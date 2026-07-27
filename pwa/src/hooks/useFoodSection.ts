import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, type FoodLogItem, type FoodSearchResult, type FoodTodayResponse } from '../lib/api';

export function useFoodSection(serverOnline: boolean) {
  const [data, setData] = useState<FoodTodayResponse | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('other');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');
  const searchTimer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    setError('');
    try {
      setData(await api.getFoodToday());
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load food log');
    }
  }, [serverOnline]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!foodName.trim() || foodName.length < 2) {
      setSearchResults([]);
      return;
    }
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      void api.searchFood(foodName.trim()).then((r) => setSearchResults(r.results)).catch(() => setSearchResults([]));
    }, 250);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [foodName]);

  const handleVoiceLog = useCallback(async (e: React.FormEvent) => {
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
  }, [description, mealType]);

  const handleManualLog = useCallback(async (e: React.FormEvent) => {
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
  }, [quantity, foodName]);

  const handleDelete = useCallback(async (row: number) => {
    if (!window.confirm('Remove this entry?')) return;
    setLoading(true);
    try {
      setData(await api.deleteFoodRow(row));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveEdit = useCallback(async (item: FoodLogItem) => {
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
  }, [editQty]);

  const startEdit = useCallback((item: FoodLogItem) => {
    setEditingRow(item.row);
    setEditQty(String(item.quantity_g));
  }, []);

  const selectSearchResult = useCallback((name: string) => {
    setFoodName(name);
    setSearchResults([]);
  }, []);

  return {
    data,
    error,
    success,
    loading,
    description,
    setDescription,
    mealType,
    setMealType,
    foodName,
    setFoodName,
    quantity,
    setQuantity,
    searchResults,
    editingRow,
    editQty,
    setEditQty,
    handleVoiceLog,
    handleManualLog,
    handleDelete,
    handleSaveEdit,
    startEdit,
    cancelEdit: () => setEditingRow(null),
    selectSearchResult,
  };
}
