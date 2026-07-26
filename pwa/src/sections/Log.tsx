import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { SwipeFoodCard } from '../components/SwipeFoodCard';
import { UndoToast } from '../components/UndoToast';
import { MealPlanQueueEmptyHint } from '../components/MealPlanQueueEmptyHint';
import { Card } from '../components/ui/Card';
import { BottomSheet } from '../components/ui/BottomSheet';
import {
  api,
  ApiError,
  type FoodLogItem,
  type FoodScanResult,
  type FoodSearchResult,
  type FoodTodayResponse,
} from '../lib/api';
import { useOptimisticFoodLog } from '../hooks/useOptimisticFoodLog';
import { useMealPlanUndo } from '../hooks/useMealPlanUndo';
import { useMealPlanQueueCount } from '../hooks/useMealPlanQueueCount';
import { addMealPhoto, getTodayMealPhotos, getMealPhotoById } from '../lib/mealPhotos';
import { lookupOpenFoodFacts, scaleOffMacros, type OffProduct } from '../lib/openFoodFacts';
import {
  enqueueRecipeScan,
  getRecipeScanQueue,
  removeRecipeScanQueueItem,
  clearRecipeScanQueue,
} from '../lib/recipeScanQueue';
import { isOfflineError } from '../lib/foodQueue';
import {
  cacheMealPlan,
  clearMealPlanQueue,
  enqueueMealPlanLog,
  getCachedMealPlan,
  getMealPlanQueue,
  removeMealPlanQueueItem,
  type MealPlanEntry,
} from '../lib/mealPlanQueue';

interface LogProps {
  serverOnline: boolean;
}

type LogTab = 'scan' | 'type' | 'mealplan' | 'recipes' | 'history';

const LOG_TABS: LogTab[] = ['scan', 'type', 'mealplan', 'recipes', 'history'];
const LOG_SHORTCUT_HINT_KEY = 'habits-log-shortcuts-hint-seen';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function shortcutModifierLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl+';
  return /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘' : 'Ctrl+';
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'other', label: 'Other' },
];

function dataUrlToFile(dataUrl: string, name = 'scan.jpg'): File {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

export function Log({ serverOnline }: LogProps) {
  const [tab, setTab] = useState<LogTab>('scan');
  const [data, setData] = useState<FoodTodayResponse | null>(null);
  const [history, setHistory] = useState<{ days: { date: string; calories: number; protein: number }[] } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('100');
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('other');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [offProduct, setOffProduct] = useState<OffProduct | null>(null);
  const [offQuantity, setOffQuantity] = useState('100');
  const [recipe, setRecipe] = useState<{
    name: string;
    items: { food: string; quantity_g: number; calories: number; protein: number }[];
    totals: { calories: number; protein: number } | null;
  } | null>(null);
  const [recipeSheetsConnected, setRecipeSheetsConnected] = useState<boolean | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipePhoto, setRecipePhoto] = useState<string | null>(null);
  const [recipeScanResult, setRecipeScanResult] = useState<FoodScanResult | null>(null);
  const [recipeScanning, setRecipeScanning] = useState(false);
  const [recipeEditOpen, setRecipeEditOpen] = useState(false);
  const [recipeEditName, setRecipeEditName] = useState('');
  const [recipeEditQty, setRecipeEditQty] = useState('100');
  const [recipeScanQueueCount, setRecipeScanQueueCount] = useState(() => getRecipeScanQueue().length);
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(() => getCachedMealPlan());
  const [loggingMealKey, setLoggingMealKey] = useState<string | null>(null);
  const [loggingMeals, setLoggingMeals] = useState(false);
  const [syncingMealPlanQueue, setSyncingMealPlanQueue] = useState(false);
  const [mealPlanSyncProgress, setMealPlanSyncProgress] = useState<{ done: number; total: number } | null>(null);
  const [showShortcutHint, setShowShortcutHint] = useState(
    () => localStorage.getItem(LOG_SHORTCUT_HINT_KEY) !== '1',
  );
  const searchTimer = useRef<number | null>(null);
  const [undoLog, setUndoLog] = useState<{
    row: number;
    food: string;
    restoreScan?: FoodScanResult | null;
    restoreRecipeScan?: FoodScanResult | null;
    restoreOffProduct?: OffProduct | null;
    restoreEditName?: string;
    restoreEditQty?: string;
    restoreOffQuantity?: string;
  } | null>(null);
  const [undoing, setUndoing] = useState(false);

  const dismissUndo = useCallback(() => setUndoLog(null), []);

  const findLoggedRow = useCallback((summary: FoodTodayResponse, food: string, qty: number) => {
    const match = [...summary.items].reverse().find(
      (i) => i.food === food && Math.abs(i.quantity_g - qty) < 0.01,
    );
    return match?.row ?? summary.items[summary.items.length - 1]?.row ?? null;
  }, []);

  const offerUndo = useCallback(
    (
      summary: FoodTodayResponse,
      food: string,
      qty: number,
      restore?: {
        scan?: FoodScanResult | null;
        recipeScan?: FoodScanResult | null;
        offProduct?: OffProduct | null;
        editName: string;
        editQty: string;
        offQuantity?: string;
      },
    ) => {
      const row = findLoggedRow(summary, food, qty);
      if (row != null && serverOnline) {
        setSuccess('');
        setUndoLog({
          row,
          food,
          restoreScan: restore?.scan,
          restoreRecipeScan: restore?.recipeScan,
          restoreOffProduct: restore?.offProduct,
          restoreEditName: restore?.editName,
          restoreEditQty: restore?.editQty,
          restoreOffQuantity: restore?.offQuantity,
        });
      }
    },
    [findLoggedRow, serverOnline, setSuccess],
  );

  const handleUndoLog = useCallback(async () => {
    if (!undoLog || undoing) return;
    setUndoing(true);
    try {
      setData(await api.deleteFoodRow(undoLog.row));
      if (undoLog.restoreScan) {
        setScanResult(undoLog.restoreScan);
        setEditName(
          undoLog.restoreEditName
            ?? undoLog.restoreScan.matched_name
            ?? undoLog.restoreScan.detected_name,
        );
        setEditQty(undoLog.restoreEditQty ?? String(undoLog.restoreScan.suggested_grams));
      } else if (undoLog.restoreRecipeScan) {
        setRecipeScanResult(undoLog.restoreRecipeScan);
        setRecipeEditName(
          undoLog.restoreEditName
            ?? undoLog.restoreRecipeScan.matched_name
            ?? undoLog.restoreRecipeScan.detected_name,
        );
        setRecipeEditQty(undoLog.restoreEditQty ?? String(undoLog.restoreRecipeScan.suggested_grams));
      } else if (undoLog.restoreOffProduct) {
        setOffProduct(undoLog.restoreOffProduct);
        setOffQuantity(undoLog.restoreOffQuantity ?? String(undoLog.restoreOffProduct.quantityG));
        setFoodName(undoLog.restoreOffProduct.name);
        setTab('scan');
      }
      setSuccess('Log undone');
      setUndoLog(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Undo failed');
    } finally {
      setUndoing(false);
    }
  }, [undoLog, undoing, setData, setSuccess, setError]);

  const dismissShortcutHint = useCallback(() => {
    localStorage.setItem(LOG_SHORTCUT_HINT_KEY, '1');
    setShowShortcutHint(false);
  }, []);

  const { pending, logItem, logMeal, logMacros, retry, dismiss, dismissAllQueued, queuedCount } = useOptimisticFoodLog({
    serverOnline,
    setData,
    setSuccess,
    setError,
  });

  const {
    undoLog: mealPlanUndo,
    undoing: mealPlanUndoing,
    dismissUndo: dismissMealPlanUndo,
    snapshotRows: snapshotFoodRows,
    offerUndoFromSummary,
    handleUndo: handleMealPlanUndo,
  } = useMealPlanUndo(serverOnline);

  const mealPlanQueueCount = useMealPlanQueueCount();

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    try {
      const [today, hist] = await Promise.all([api.getFoodToday(), api.getFoodHistory(14)]);
      setData(today);
      setHistory(hist);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
    }
  }, [serverOnline]);

  const loadMealPlan = useCallback(async () => {
    if (!serverOnline) {
      setMealPlan(getCachedMealPlan());
      return;
    }
    try {
      const res = await api.getMealPlanToday();
      setMealPlan(res.meals ?? []);
      cacheMealPlan(res.meals ?? []);
    } catch {
      setMealPlan(getCachedMealPlan());
    }
  }, [serverOnline]);

  const flushMealPlanQueue = useCallback(async () => {
    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    const queue = getMealPlanQueue();
    if (!queue.length) return;

    setSyncingMealPlanQueue(true);
    setError('');
    dismissMealPlanUndo();
    const total = queue.length;
    setMealPlanSyncProgress({ done: 0, total });
    let synced = 0;
    const labels: string[] = [];
    let lastSummary: FoodTodayResponse | null = null;

    try {
      const before = data ?? (await api.getFoodToday());
      const beforeRows = snapshotFoodRows(before);

      for (const item of queue) {
        try {
          let summary: FoodTodayResponse | null = null;
          if (item.kind === 'all') {
            summary = (await api.logMealPlanToday()).summary;
          } else if (item.meal) {
            summary = (await api.logMealPlanItem(item.meal)).summary;
          } else {
            continue;
          }
          removeMealPlanQueueItem(item.id);
          lastSummary = summary;
          synced += 1;
          setMealPlanSyncProgress({ done: synced, total });
          labels.push(
            item.kind === 'all'
              ? 'All planned meals'
              : item.label ?? item.meal ?? 'Meal',
          );
        } catch (e) {
          if (isOfflineError(e)) break;
          setError(e instanceof Error ? e.message : 'Meal plan sync failed');
          break;
        }
      }
      if (synced > 0 && lastSummary) {
        setData(lastSummary);
        const label = synced === 1 ? labels[0]! : `${synced} queued meal logs`;
        if (!offerUndoFromSummary(beforeRows, lastSummary, label)) {
          setSuccess(`Synced ${synced} queued meal log${synced === 1 ? '' : 's'}`);
        }
      }
    } finally {
      setSyncingMealPlanQueue(false);
      setMealPlanSyncProgress(null);
    }
  }, [serverOnline, data, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary]);

  const logMealPlanEntry = useCallback(
    (entry: MealPlanEntry) => {
      setLoggingMealKey(entry.meal);
      setSuccess('');
      setError('');
      dismissMealPlanUndo();

      if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        enqueueMealPlanLog({
          kind: 'item',
          meal: entry.meal,
          label: entry.label,
          description: entry.description,
        });
        setSuccess(`${entry.label} queued — will log when online`);
        setLoggingMealKey(null);
        return;
      }

      void (async () => {
        try {
          const before = data ?? (await api.getFoodToday());
          const res = await api.logMealPlanItem(entry.meal);
          setData(res.summary);
          if (!offerUndoFromSummary(snapshotFoodRows(before), res.summary, entry.label)) {
            setSuccess(res.message);
          }
        } catch (e) {
          if (isOfflineError(e)) {
            enqueueMealPlanLog({
              kind: 'item',
              meal: entry.meal,
              label: entry.label,
              description: entry.description,
            });
            setSuccess(`${entry.label} queued — will log when online`);
            return;
          }
          setError(e instanceof Error ? e.message : 'Meal log failed');
        } finally {
          setLoggingMealKey(null);
        }
      })();
    },
    [serverOnline, data, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary, setData, setSuccess, setError],
  );

  const logAllMealPlan = useCallback(() => {
    setLoggingMeals(true);
    setSuccess('');
    setError('');
    dismissMealPlanUndo();

    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      enqueueMealPlanLog({ kind: 'all' });
      setSuccess('All planned meals queued — will log when online');
      setLoggingMeals(false);
      return;
    }

    void (async () => {
      try {
        const before = data ?? (await api.getFoodToday());
        const res = await api.logMealPlanToday();
        setData(res.summary);
        if (!offerUndoFromSummary(snapshotFoodRows(before), res.summary, 'All planned meals')) {
          setSuccess(res.message);
        }
      } catch (e) {
        if (isOfflineError(e)) {
          enqueueMealPlanLog({ kind: 'all' });
          setSuccess('All planned meals queued — will log when online');
          return;
        }
        setError(e instanceof Error ? e.message : 'Meal log failed');
      } finally {
        setLoggingMeals(false);
      }
    })();
  }, [serverOnline, data, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary, setData, setSuccess, setError]);

  const loadSavedRecipe = useCallback(async () => {
    if (!serverOnline) return;
    setRecipeLoading(true);
    setError('');
    try {
      const r = await api.getSavedRecipe();
      setRecipe(r.recipe);
      setRecipeSheetsConnected(r.sheets_connected);
    } catch (e) {
      setRecipe(null);
      setRecipeSheetsConnected(null);
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load saved recipe');
    } finally {
      setRecipeLoading(false);
    }
  }, [serverOnline]);

  useEffect(() => {
    void refresh();
    if (tab === 'recipes') void loadSavedRecipe();
    if (tab === 'mealplan') void loadMealPlan();
  }, [refresh, tab, loadSavedRecipe, loadMealPlan]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const num = Number.parseInt(e.key, 10);
      if (num < 1 || num > LOG_TABS.length) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      setTab(LOG_TABS[num - 1]);
      dismissShortcutHint();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dismissShortcutHint]);

  useEffect(() => {
    if (tab !== 'recipes') return;
    const label = recipe?.name ?? 'Recipe';
    const match = getTodayMealPhotos().find((p) => p.label === label);
    setRecipePhoto(match?.dataUrl ?? null);
  }, [tab, recipe?.name]);

  const syncRecipeScanQueueCount = useCallback(() => {
    setRecipeScanQueueCount(getRecipeScanQueue().length);
  }, []);

  const dismissRecipeScanQueue = useCallback(() => {
    clearRecipeScanQueue();
    syncRecipeScanQueueCount();
    setSuccess('Recipe scan queue cleared');
  }, [syncRecipeScanQueueCount]);

  const dismissFoodLogQueue = useCallback(() => {
    dismissAllQueued();
    setSuccess('Offline food log queue cleared');
  }, [dismissAllQueued]);

  const processRecipeScanQueue = useCallback(async () => {
    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    if (recipeScanning || recipeScanResult) return;

    const queue = getRecipeScanQueue();
    if (!queue.length) return;

    const item = queue[0];
    const photo = getMealPhotoById(item.photoId);
    if (!photo) {
      removeRecipeScanQueueItem(item.id);
      syncRecipeScanQueueCount();
      void processRecipeScanQueue();
      return;
    }

    setRecipeScanning(true);
    setError('');
    try {
      const result = await api.scanFood(dataUrlToFile(photo.dataUrl, 'recipe.jpg'));
      removeRecipeScanQueueItem(item.id);
      syncRecipeScanQueueCount();
      setRecipePhoto(photo.dataUrl);
      setRecipeScanResult(result);
      setRecipeEditName(result.matched_name ?? result.detected_name);
      setRecipeEditQty(String(result.suggested_grams));
      setSuccess(
        `Identified ${result.matched_name ?? result.detected_name} from queued recipe photo — swipe to log`,
      );
    } catch (e) {
      if (isOfflineError(e)) return;
      setError(e instanceof Error ? e.message : 'Queued recipe scan failed');
    } finally {
      setRecipeScanning(false);
    }
  }, [serverOnline, recipeScanning, recipeScanResult, syncRecipeScanQueueCount]);

  useEffect(() => {
    void processRecipeScanQueue();
  }, [processRecipeScanQueue]);

  useEffect(() => {
    const onOnline = () => {
      syncRecipeScanQueueCount();
      void processRecipeScanQueue();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [processRecipeScanQueue, syncRecipeScanQueueCount]);

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

  async function handleCapture(dataUrl: string) {
    setLoading(true);
    setError('');
    try {
      const file = dataUrlToFile(dataUrl);
      const result = await api.scanFood(file);
      setScanResult(result);
      setEditName(result.matched_name ?? result.detected_name);
      setEditQty(String(result.suggested_grams));
      addMealPhoto(dataUrl, result.matched_name ?? result.detected_name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  }

  async function logScan(name: string, qty: number) {
    const savedScan = scanResult;
    const savedName = editName;
    const savedQty = editQty;
    setScanResult(null);
    await logItem(name, qty, (summary) => {
      offerUndo(summary, name, qty, {
        scan: savedScan,
        editName: savedName,
        editQty: savedQty,
      });
    });
  }

  async function handleVoiceLog(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSuccess('');
    const desc = description.trim();
    const meal = mealType;
    setDescription('');
    await logMeal(desc, meal);
  }

  async function handleRecipePhoto(dataUrl: string) {
    const label = recipe?.name ?? 'Recipe';
    const photo = addMealPhoto(dataUrl, label);
    setRecipePhoto(dataUrl);
    setRecipeScanResult(null);
    setError('');

    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      enqueueRecipeScan(photo.id, label);
      syncRecipeScanQueueCount();
      setSuccess('Recipe photo saved — scan queued for when online');
      return;
    }

    setRecipeScanning(true);
    try {
      const result = await api.scanFood(dataUrlToFile(dataUrl, 'recipe.jpg'));
      setRecipeScanResult(result);
      setRecipeEditName(result.matched_name ?? result.detected_name);
      setRecipeEditQty(String(result.suggested_grams));
      setSuccess(
        `Identified ${result.matched_name ?? result.detected_name} — swipe to log or use saved recipe below`,
      );
    } catch (e) {
      if (isOfflineError(e)) {
        enqueueRecipeScan(photo.id, label);
        syncRecipeScanQueueCount();
        setSuccess('Recipe photo saved — scan queued for when online');
        return;
      }
      setSuccess('Recipe photo saved — visible on Home');
      setError(e instanceof Error ? e.message : 'Recipe scan failed');
    } finally {
      setRecipeScanning(false);
    }
  }

  async function logRecipeScan(name: string, qty: number) {
    const savedScan = recipeScanResult;
    const savedName = recipeEditName;
    const savedQty = recipeEditQty;
    setRecipeScanResult(null);
    await logItem(name, qty, (summary) => {
      offerUndo(summary, name, qty, {
        recipeScan: savedScan,
        editName: savedName,
        editQty: savedQty,
      });
    });
    syncRecipeScanQueueCount();
    void processRecipeScanQueue();
  }

  async function handleManualLog(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number.parseFloat(quantity);
    if (!foodName.trim() || !qty) return;
    const name = foodName.trim();
    setFoodName('');
    setSearchResults([]);
    await logItem(name, qty, (summary) => {
      offerUndo(summary, name, qty);
    });
  }

  async function handleLogOffProduct() {
    if (!offProduct) return;
    const qty = Number.parseFloat(offQuantity);
    if (!qty || qty <= 0) return;
    const savedOff = offProduct;
    const savedQty = offQuantity;
    setLoading(true);
    setError('');
    try {
      const macros = scaleOffMacros(offProduct.per100g, qty);
      await logMacros(offProduct.name, qty, macros, (summary) => {
        setOffProduct(null);
        setFoodName('');
        setSearchResults([]);
        offerUndo(summary, savedOff.name, qty, {
          offProduct: savedOff,
          editName: savedOff.name,
          editQty: savedQty,
          offQuantity: savedQty,
        });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Open Food Facts log failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleBarcode(code: string) {
    setError('');
    setSuccess('');
    setOffProduct(null);
    setTab('type');
    setLoading(true);
    try {
      if (serverOnline) {
        const res = await api.searchFood(code);
        if (res.results[0]) {
          setFoodName(res.results[0].name);
          setSearchResults(res.results);
          setSuccess(`Found in your database: ${res.results[0].name}`);
          return;
        }
      }

      const off = await lookupOpenFoodFacts(code);
      if (off) {
        setOffProduct(off);
        setOffQuantity(String(off.quantityG));
        setFoodName(off.name);
        if (serverOnline) {
          const local = await api.searchFood(off.name.split(/\s+/)[0] ?? off.name);
          setSearchResults(local.results);
        } else {
          setSearchResults([]);
        }
        setSuccess(
          `Open Food Facts: ${off.name}${off.brand ? ` (${off.brand})` : ''} — log directly or pick a sheet match`,
        );
        return;
      }

      setFoodName(code);
      setSearchResults([]);
      if (serverOnline) {
        const res = await api.searchFood(code);
        setSearchResults(res.results);
      }
      setSuccess(`Barcode ${code} — not found in Open Food Facts or your database`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Barcode lookup failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(row: number) {
    if (!window.confirm('Remove this entry?')) return;
    setLoading(true);
    try {
      setData(await api.deleteFoodRow(row));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" aria-labelledby="log-heading">
      <h1 id="log-heading">Log Food</h1>
      <p className="muted">Scan, type, or review history</p>

      {queuedCount > 0 && (
        <div className="banner banner-warn banner-row" role="status">
          <span>
            {queuedCount} food log{queuedCount === 1 ? '' : 's'} queued offline — will sync when online.
          </span>
          <button
            type="button"
            className="btn-small"
            aria-label="Dismiss offline food log queue"
            onClick={dismissFoodLogQueue}
          >
            Dismiss
          </button>
        </div>
      )}

      {recipeScanQueueCount > 0 && (
        <div className="banner banner-warn banner-row" role="status">
          <span>
            {recipeScanQueueCount} recipe photo{recipeScanQueueCount === 1 ? '' : 's'} queued — will scan when online.
          </span>
          <button
            type="button"
            className="btn-small"
            aria-label="Dismiss recipe scan queue"
            onClick={dismissRecipeScanQueue}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="sub-tabs" role="tablist" aria-label="Log food views">
        {LOG_TABS.map((t, index) => {
          const label =
            t === 'scan'
              ? 'Scan'
              : t === 'type'
                ? 'Type'
                : t === 'mealplan'
                  ? 'Plan'
                  : t === 'recipes'
                    ? 'Recipes'
                    : 'History';
          return (
          <button
            key={t}
            type="button"
            role="tab"
            id={`log-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`log-panel-${t}`}
            aria-keyshortcuts={`${shortcutModifierLabel()}${index + 1}`}
            className={`sub-tab ${tab === t ? 'sub-tab-active' : ''}`}
            onClick={() => {
              setTab(t);
              dismissShortcutHint();
            }}
          >
            {label}
          </button>
        );})}
      </div>

      {showShortcutHint && (
        <p className="log-shortcut-hint muted" role="note">
          Tip: press <kbd>{shortcutModifierLabel()}1</kbd>–<kbd>{shortcutModifierLabel()}5</kbd> to switch tabs.{' '}
          <button type="button" className="link-btn" onClick={dismissShortcutHint}>
            Got it
          </button>
        </p>
      )}

      <div role="tabpanel" id={`log-panel-${tab}`} aria-labelledby={`log-tab-${tab}`}>
      {tab === 'scan' && (
        <>
          {!scanResult ? (
            <Card>
              <h2>Camera scan</h2>
              <p className="muted">Point at your food — like Google Translate</p>
              <CameraCapture
                facingMode="environment"
                placeholder="Point at your food — like Google Translate"
                onCapture={(url) => void handleCapture(url)}
                disabled={!serverOnline || loading}
              />
              {loading && <p className="muted" role="status" aria-live="polite">Identifying food…</p>}
            </Card>
          ) : (
            <SwipeFoodCard
              scan={scanResult}
              onAction={(dir) => {
                if (dir === 'right') {
                  void logScan(editName, Number.parseFloat(editQty) || scanResult.suggested_grams);
                } else if (dir === 'up') {
                  setScanResult(null);
                }
              }}
              onEdit={() => setEditOpen(true)}
            />
          )}
        </>
      )}

      {tab === 'type' && (
        <>
          <Card>
            <h2>Barcode</h2>
            <p className="muted">Scan packaged food — looks up your sheet, then Open Food Facts</p>
            <BarcodeScanner
              disabled={loading}
              onScan={(code) => void handleBarcode(code)}
            />
          </Card>

          {offProduct && (
            <Card className="off-product-card">
              <h2>Open Food Facts</h2>
              <p className="off-product-name">{offProduct.name}</p>
              {offProduct.brand && <p className="muted">{offProduct.brand}</p>}
              <p className="muted">Per 100g · barcode {offProduct.barcode}</p>
              <div className="off-product-macros">
                <span>{offProduct.per100g.calories} kcal</span>
                <span>{offProduct.per100g.protein}g protein</span>
                <span>{offProduct.per100g.carbs}g carbs</span>
                <span>{offProduct.per100g.fat}g fat</span>
              </div>
              <label className="field">
                Serving (g)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={offQuantity}
                  onChange={(e) => setOffQuantity(e.target.value)}
                  disabled={loading}
                />
              </label>
              {(() => {
                const qty = Number.parseFloat(offQuantity);
                if (!qty || qty <= 0) return null;
                const scaled = scaleOffMacros(offProduct.per100g, qty);
                return (
                  <p className="muted">
                    For {qty}g: {scaled.calories} kcal · {scaled.protein}g protein
                  </p>
                );
              })()}
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleLogOffProduct()}
              >
                Log from Open Food Facts
              </button>
              <p className="muted">Or pick a matching food from your sheet below</p>
            </Card>
          )}

          <form className="card" onSubmit={handleVoiceLog}>
            <h2>Quick log</h2>
            <label className="field">
              What did you eat?
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="200g paneer and 250g broccoli"
                disabled={!serverOnline || loading}
              />
            </label>
            <label className="field">
              Meal
              <select value={mealType} onChange={(e) => setMealType(e.target.value)} disabled={!serverOnline || loading}>
                {MEAL_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={!serverOnline || loading || !description.trim()}>Log meal</button>
          </form>

          <form className="card" onSubmit={handleManualLog}>
            <h2>Manual entry</h2>
            <label className="field">
              Food
              <input
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Arla Paneer"
                disabled={!serverOnline || loading}
                autoComplete="off"
              />
            </label>
            {searchResults.length > 0 && (
              <ul className="search-suggestions">
                {searchResults.map((r) => (
                  <li key={r.name}>
                    <button type="button" onClick={() => { setFoodName(r.name); setSearchResults([]); }}>
                      {r.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label className="field">
              Quantity (g)
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={!serverOnline || loading} />
            </label>
            <button type="submit" disabled={!serverOnline || loading || !foodName.trim()}>Add</button>
          </form>

          <Card>
            <h2>Today&apos;s log</h2>
            {!pending.length && !data?.items.length ? (
              <p className="muted">No entries yet.</p>
            ) : (
              <ul className="food-list">
                {pending.map((entry) => (
                  <li
                    key={entry.id}
                    className={`food-row food-row--${entry.status}`}
                  >
                    <div>
                      <strong>{entry.food}</strong>
                      <span className="muted">
                        {entry.quantity_g > 0 ? ` · ${entry.quantity_g}g` : ''}
                        {entry.source === 'macros' ? ' · Open Food Facts' : ''}
                        {entry.status === 'pending'
                          ? ' · Saving…'
                          : entry.status === 'queued'
                            ? ' · Queued offline'
                            : ' · Failed to save'}
                      </span>
                    </div>
                    {entry.status === 'failed' && (
                      <div className="food-row-actions">
                        <button type="button" className="btn-small" onClick={() => retry(entry)}>
                          Retry
                        </button>
                        <button type="button" className="btn-small btn-danger" aria-label="Dismiss failed entry" onClick={() => dismiss(entry.id)}>
                          ×
                        </button>
                      </div>
                    )}
                  </li>
                ))}
                {data?.items.map((item: FoodLogItem) => (
                  <li key={item.row} className="food-row">
                    <div>
                      <strong>{item.food}</strong>
                      <span className="muted"> · {item.quantity_g}g · {item.protein.toFixed(1)}g protein</span>
                    </div>
                    <button type="button" className="btn-small btn-danger" aria-label={`Remove ${item.food}`} onClick={() => void handleDelete(item.row)}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      {tab === 'recipes' && (
        <>
          <Card>
            <h2>Recipe photo</h2>
            <p className="muted">
              Photograph your prepared meal — AI identifies it for logging and saves to Home gallery
            </p>
            {recipePhoto && (
              <img
                src={recipePhoto}
                alt={recipe?.name ? `Photo of ${recipe.name}` : 'Recipe photo'}
                className="recipe-photo-preview"
              />
            )}
            {!recipeScanResult && (
              <CameraCapture
                facingMode="environment"
                placeholder="Photograph your prepared recipe"
                onCapture={(url) => void handleRecipePhoto(url)}
                disabled={loading || recipeScanning}
              />
            )}
            {recipeScanning && (
              <p className="muted" role="status" aria-live="polite">Identifying recipe…</p>
            )}
          </Card>

          {recipeScanResult && (
            <SwipeFoodCard
              scan={recipeScanResult}
              onAction={(dir) => {
                if (dir === 'right') {
                  void logRecipeScan(
                    recipeEditName,
                    Number.parseFloat(recipeEditQty) || recipeScanResult.suggested_grams,
                  );
                } else if (dir === 'up' || dir === 'left') {
                  setRecipeScanResult(null);
                  syncRecipeScanQueueCount();
                  void processRecipeScanQueue();
                }
              }}
              onEdit={() => setRecipeEditOpen(true)}
            />
          )}

          <Card>
            <div className="home-export-row">
              <div>
                <h2>Saved recipe</h2>
                <p className="muted">From Save Reciepe tab in Nutrition sheet</p>
              </div>
              <button
                type="button"
                className="btn-small"
                disabled={!serverOnline || recipeLoading}
                aria-label="Refresh saved recipe from sheet"
                onClick={() => void loadSavedRecipe()}
              >
                {recipeLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>
            {!serverOnline ? (
              <p className="muted">Connect to server to browse Save Reciepe sheet.</p>
            ) : recipeSheetsConnected === false ? (
              <p className="muted">Google Sheets not connected — link in Settings.</p>
            ) : !recipe ? (
              <p className="muted">No saved recipe found in Save Reciepe tab.</p>
            ) : (
              <>
                <h3>{recipe.name}</h3>
                <ul className="food-list">
                  {recipe.items.map((item) => (
                    <li key={item.food} className="food-row">
                      <div>
                        <strong>{item.food}</strong>
                        <span className="muted">
                          {item.quantity_g}g · {item.protein.toFixed(1)}g protein · {item.calories.toFixed(0)} kcal
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-small"
                        disabled={!serverOnline || loading}
                        aria-label={`Log ${item.food}`}
                        onClick={() =>
                          void logItem(item.food, item.quantity_g, (summary) => {
                            offerUndo(summary, item.food, item.quantity_g);
                          })
                        }
                      >
                        Log
                      </button>
                    </li>
                  ))}
                </ul>
                {recipe.totals && (
                  <p className="muted">
                    Total: {recipe.totals.calories.toFixed(0)} kcal · {recipe.totals.protein.toFixed(1)}g protein
                  </p>
                )}
                <button
                  type="button"
                  disabled={!serverOnline || loading}
                  onClick={() => {
                    setLoading(true);
                    void api
                      .logSavedRecipe()
                      .then((res) => {
                        setData(res.summary);
                        setSuccess(res.message);
                      })
                      .catch((e) => setError(e instanceof Error ? e.message : 'Recipe log failed'))
                      .finally(() => setLoading(false));
                  }}
                >
                  Log entire recipe today
                </button>
              </>
            )}
          </Card>
        </>
      )}

      {tab === 'mealplan' && (
        <>
          {(mealPlanQueueCount > 0 || syncingMealPlanQueue) ? (
            <div
              className={`home-meal-plan-queue-panel${syncingMealPlanQueue ? ' home-meal-plan-queue-panel--syncing' : ''}`}
            >
              <div className="banner banner-warn banner-row" role="status">
                <span>
                  {syncingMealPlanQueue && mealPlanSyncProgress
                    ? `Syncing meal logs (${mealPlanSyncProgress.done}/${mealPlanSyncProgress.total})…`
                    : `${mealPlanQueueCount} meal log${mealPlanQueueCount === 1 ? '' : 's'} queued${serverOnline ? ' — tap Sync now' : ' — will sync when online'}.`}
                </span>
                {serverOnline && (
                  <button
                    type="button"
                    className="btn-small"
                    disabled={syncingMealPlanQueue}
                    onClick={() => void flushMealPlanQueue()}
                  >
                    {syncingMealPlanQueue ? 'Syncing…' : 'Sync now'}
                  </button>
                )}
                <button
                  type="button"
                  className="btn-small"
                  aria-label="Dismiss meal plan log queue"
                  disabled={syncingMealPlanQueue}
                  onClick={() => {
                    clearMealPlanQueue();
                    setSuccess('Meal plan log queue cleared');
                  }}
                >
                  Dismiss
                </button>
              </div>
              {syncingMealPlanQueue && mealPlanSyncProgress && mealPlanSyncProgress.total > 0 && (
                <div
                  className="home-meal-plan-sync-progress"
                  role="progressbar"
                  aria-valuenow={mealPlanSyncProgress.done}
                  aria-valuemin={0}
                  aria-valuemax={mealPlanSyncProgress.total}
                  aria-label="Meal plan sync progress"
                >
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${(mealPlanSyncProgress.done / mealPlanSyncProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <MealPlanQueueEmptyHint />
          )}
        <Card>
          <h2>Today&apos;s meal plan</h2>
          <p className="muted">From WEEK MEALS sheet · shortcut <kbd>{shortcutModifierLabel()}3</kbd></p>
          {!mealPlan.length ? (
            <p className="muted">No meals planned for today.</p>
          ) : (
            <>
              <ul className="food-list">
                {mealPlan.map((m) => (
                  <li key={m.meal} className="food-row">
                    <div>
                      <strong>{m.label}</strong>
                      <span className="muted">{m.description}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-small"
                      disabled={loggingMealKey === m.meal}
                      aria-label={`Log ${m.label}`}
                      onClick={() => logMealPlanEntry(m)}
                    >
                      {loggingMealKey === m.meal ? 'Logging…' : 'Log'}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={loggingMeals || !!loggingMealKey}
                onClick={logAllMealPlan}
              >
                {loggingMeals ? 'Logging…' : 'Log all planned meals'}
              </button>
            </>
          )}
        </Card>
        </>
      )}

      {tab === 'history' && (
        <Card>
          <h2>14-day history</h2>
          {!history?.days.length ? (
            <p className="muted">No history in Followed tab.</p>
          ) : (
            <ul className="food-list">
              {[...history.days].reverse().map((d) => (
                <li key={d.date} className="food-row">
                  <strong>{d.date}</strong>
                  <span className="muted">
                    {d.calories.toFixed(0)} kcal · {d.protein.toFixed(1)}g protein
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      </div>

      <BottomSheet open={recipeEditOpen} onClose={() => setRecipeEditOpen(false)} title="Edit recipe scan">
        <label className="field">
          Food name
          <input value={recipeEditName} onChange={(e) => setRecipeEditName(e.target.value)} />
        </label>
        <label className="field">
          Quantity (g)
          <input type="number" value={recipeEditQty} onChange={(e) => setRecipeEditQty(e.target.value)} />
        </label>
        <button
          type="button"
          onClick={() => {
            void logRecipeScan(recipeEditName, Number.parseFloat(recipeEditQty));
            setRecipeEditOpen(false);
          }}
        >
          Log food
        </button>
      </BottomSheet>

      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit scan">
        <label className="field">
          Food name
          <input value={editName} onChange={(e) => setEditName(e.target.value)} />
        </label>
        <label className="field">
          Quantity (g)
          <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} />
        </label>
        <button
          type="button"
          onClick={() => {
            void logScan(editName, Number.parseFloat(editQty));
            setEditOpen(false);
          }}
        >
          Log food
        </button>
      </BottomSheet>

      <div role="status" aria-live="polite">
        {success && !undoLog && !mealPlanUndo && <div className="banner banner-ok">{success}</div>}
      </div>
      {error && <div className="banner banner-warn" role="alert">{error}</div>}

      {undoLog && (
        <UndoToast
          message={`Logged ${undoLog.food}`}
          onUndo={() => void handleUndoLog()}
          onDismiss={dismissUndo}
          undoing={undoing}
        />
      )}
      {mealPlanUndo && (
        <UndoToast
          message={`Logged ${mealPlanUndo.label}`}
          onUndo={() => void handleMealPlanUndo(() => setSuccess('Log undone'))}
          onDismiss={dismissMealPlanUndo}
          undoing={mealPlanUndoing}
        />
      )}
    </section>
  );
}
