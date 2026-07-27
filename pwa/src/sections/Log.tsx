import { useCallback, useEffect, useRef, useState } from 'react';
import { FoodQueueBanner } from '../components/FoodQueueBanner';
import { LogFoodEditSheet } from '../components/LogFoodEditSheet';
import { LogHistoryPanel } from '../components/LogHistoryPanel';
import { LogMealPlanTabPanel } from '../components/LogMealPlanTabPanel';
import { LogRecipesTabPanel } from '../components/LogRecipesTabPanel';
import { LogScanTabPanel } from '../components/LogScanTabPanel';
import { LogSubTabs } from '../components/LogSubTabs';
import { LogTypeTabPanel } from '../components/LogTypeTabPanel';
import { RecipeScanQueueSection } from '../components/RecipeScanQueueSection';
import { UndoToast } from '../components/UndoToast';
import { MealPlanQueueSection } from '../components/MealPlanQueueSection';
import { MealPlanSyncAwarenessSlot } from '../components/MealPlanSyncAwarenessSlot';
import {
  api,
  ApiError,
  type FoodScanResult,
  type FoodSearchResult,
  type FoodTodayResponse,
} from '../lib/api';
import { useOptimisticFoodLog } from '../hooks/useOptimisticFoodLog';
import { useMealPlanUndo } from '../hooks/useMealPlanUndo';
import { useMealPlanQueueSync } from '../hooks/useMealPlanQueueSync';
import { useMealPlanEntryLogging } from '../hooks/useMealPlanEntryLogging';
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
  addScanHistory,
  clearScanHistory,
  getScanHistory,
  type ScanHistoryEntry,
} from '../lib/scanHistory';
import {
  dataUrlToFile,
  isTypingTarget,
  LOG_SHORTCUT_HINT_KEY,
  LOG_TABS,
  type LogTab,
} from '../lib/logSectionShared';
import {
  cacheMealPlan,
  dismissAllMealPlanQueue,
  getCachedMealPlan,
  type MealPlanEntry,
  type MealPlanSyncSource,
} from '../lib/mealPlanQueue';

interface LogProps {
  serverOnline: boolean;
  openMealPlan?: boolean;
  onMealPlanOpened?: () => void;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
}

export function Log({
  serverOnline,
  openMealPlan,
  onMealPlanOpened,
  onNavigateMealPlanSyncSource,
  scrollToMealPlanQueue,
}: LogProps) {
  const [tab, setTab] = useState<LogTab>('scan');
  const [data, setData] = useState<FoodTodayResponse | null>(null);
  const [history, setHistory] = useState<{ days: { date: string; calories: number; protein: number }[] } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState(() => getScanHistory());
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
  const [recipeScanQueue, setRecipeScanQueue] = useState(() => getRecipeScanQueue());
  const [recipeScanQueueSyncClearedToken, setRecipeScanQueueSyncClearedToken] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(() => getCachedMealPlan());
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

  const { pending, logItem, logMeal, logMacros, retry, dismiss, dismissAllQueued, queuedCount, queueSyncClearedToken } = useOptimisticFoodLog({
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

  const getFoodBeforeSync = useCallback(async () => data ?? (await api.getFoodToday()), [data]);

  const {
    mealPlanQueue,
    syncingMealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    syncMealPlanQueue,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
  } = useMealPlanQueueSync({
    serverOnline,
    syncSource: 'log',
    active: tab === 'mealplan',
    autoFlushOnMount: true,
    watchOnline: true,
    watchQueueChanges: true,
    getFoodBeforeSync,
    onFoodUpdated: setData,
    dismissMealPlanUndo,
    snapshotFoodRows,
    offerUndoFromSummary,
    onBatchSynced: (synced, offeredUndo) => {
      if (!offeredUndo) {
        setSuccess(`Synced ${synced} queued meal log${synced === 1 ? '' : 's'}`);
      }
    },
    onItemLogged: (label, offeredUndo) => {
      if (!offeredUndo) setSuccess(`Logged ${label}`);
    },
    onItemOffline: (label) => setSuccess(`${label} still queued — offline`),
    setError,
    clearError: () => setError(''),
  });

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

  const { loggingMealKey, loggingMeals, logMealPlanEntry, logAllMealPlan } = useMealPlanEntryLogging({
    serverOnline,
    syncSource: 'log',
    syncMealPlanQueue,
    dismissMealPlanUndo,
    snapshotFoodRows,
    offerUndoFromSummary,
    setMessage: setSuccess,
    setError,
    getFoodBeforeSync,
    onFoodUpdated: setData,
  });

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
    if (!openMealPlan) return;
    setTab('mealplan');
    onMealPlanOpened?.();
  }, [openMealPlan, onMealPlanOpened]);

  useEffect(() => {
    if (!scrollToMealPlanQueue) return;
    setTab('mealplan');
  }, [scrollToMealPlanQueue]);

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

  const syncRecipeScanQueue = useCallback(() => {
    setRecipeScanQueue(getRecipeScanQueue());
  }, []);

  const notifyRecipeScanQueueClearedIfEmpty = useCallback(() => {
    if (getRecipeScanQueue().length === 0) {
      setRecipeScanQueueSyncClearedToken((token) => token + 1);
    }
  }, []);

  const dismissRecipeScanQueue = useCallback(() => {
    clearRecipeScanQueue();
    syncRecipeScanQueue();
    setSuccess('Recipe scan queue cleared');
  }, [syncRecipeScanQueue]);

  const dismissFoodLogQueue = useCallback(() => {
    if (!window.confirm(`Discard ${queuedCount} queued food log${queuedCount === 1 ? '' : 's'}? They will not sync.`)) return;
    dismissAllQueued();
    setSuccess('Offline food log queue cleared');
  }, [dismissAllQueued, queuedCount]);

  const processRecipeScanQueue = useCallback(async () => {
    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    if (recipeScanning || recipeScanResult) return;

    const queue = getRecipeScanQueue();
    if (!queue.length) return;

    const item = queue[0];
    const photo = getMealPhotoById(item.photoId);
    if (!photo) {
      removeRecipeScanQueueItem(item.id);
      syncRecipeScanQueue();
      notifyRecipeScanQueueClearedIfEmpty();
      void processRecipeScanQueue();
      return;
    }

    setRecipeScanning(true);
    setError('');
    try {
      const result = await api.scanFood(dataUrlToFile(photo.dataUrl, 'recipe.jpg'));
      removeRecipeScanQueueItem(item.id);
      syncRecipeScanQueue();
      notifyRecipeScanQueueClearedIfEmpty();
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
  }, [serverOnline, recipeScanning, recipeScanResult, syncRecipeScanQueue, notifyRecipeScanQueueClearedIfEmpty]);

  useEffect(() => {
    void processRecipeScanQueue();
  }, [processRecipeScanQueue]);

  useEffect(() => {
    const onOnline = () => {
      syncRecipeScanQueue();
      void processRecipeScanQueue();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [processRecipeScanQueue, syncRecipeScanQueue]);

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
    setScanPreviewUrl(dataUrl);
    setLoading(true);
    setError('');
    setScanResult(null);
    try {
      const file = dataUrlToFile(dataUrl);
      const result = await api.scanFood(file);
      setScanResult(result);
      setEditName(result.matched_name ?? result.detected_name);
      setEditQty(String(result.suggested_grams));
      addMealPhoto(dataUrl, result.matched_name ?? result.detected_name);
      addScanHistory(dataUrl, result);
      setScanHistory(getScanHistory());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  }

  function clearScanFlow() {
    setScanResult(null);
    setScanPreviewUrl(null);
  }

  function restoreScanFromHistory(entry: ScanHistoryEntry) {
    setScanPreviewUrl(entry.imageUrl);
    setScanResult(entry.scan);
    setEditName(entry.scan.matched_name ?? entry.scan.detected_name);
    setEditQty(String(entry.scan.suggested_grams));
    setError('');
  }

  function handleClearScanHistory() {
    clearScanHistory();
    setScanHistory([]);
  }

  async function logScan(name: string, qty: number) {
    const savedScan = scanResult;
    const savedName = editName;
    const savedQty = editQty;
    clearScanFlow();
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
      syncRecipeScanQueue();
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
        syncRecipeScanQueue();
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
    syncRecipeScanQueue();
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

      <FoodQueueBanner
        queuedCount={queuedCount}
        queueSyncClearedToken={queueSyncClearedToken}
        onDismiss={dismissFoodLogQueue}
      />

      <RecipeScanQueueSection
        queue={recipeScanQueue}
        queueSyncClearedToken={recipeScanQueueSyncClearedToken}
        onDismiss={dismissRecipeScanQueue}
      />

      <MealPlanSyncAwarenessSlot
        viewer="log"
        onNavigate={onNavigateMealPlanSyncSource}
        visible={tab !== 'mealplan'}
        showOwnSource={tab !== 'mealplan'}
      />

      <LogSubTabs
        tab={tab}
        onTabChange={setTab}
        showShortcutHint={showShortcutHint}
        onDismissShortcutHint={dismissShortcutHint}
      />

      <div role="tabpanel" id={`log-panel-${tab}`} aria-labelledby={`log-tab-${tab}`}>
        {tab === 'scan' && (
          <LogScanTabPanel
            serverOnline={serverOnline}
            loading={loading}
            scanPreviewUrl={scanPreviewUrl}
            scanResult={scanResult}
            scanHistory={scanHistory}
            editName={editName}
            editQty={editQty}
            onCapture={(url) => void handleCapture(url)}
            onClearScan={clearScanFlow}
            onRestoreScan={restoreScanFromHistory}
            onClearScanHistory={handleClearScanHistory}
            onEditOpen={() => setEditOpen(true)}
            onLogScan={(name, qty) => void logScan(name, qty)}
          />
        )}

        {tab === 'type' && (
          <LogTypeTabPanel
            serverOnline={serverOnline}
            loading={loading}
            offProduct={offProduct}
            offQuantity={offQuantity}
            description={description}
            mealType={mealType}
            foodName={foodName}
            quantity={quantity}
            searchResults={searchResults}
            pending={pending}
            data={data}
            onBarcodeScan={(code) => void handleBarcode(code)}
            onOffQuantityChange={setOffQuantity}
            onLogOffProduct={() => void handleLogOffProduct()}
            onVoiceLog={handleVoiceLog}
            onDescriptionChange={setDescription}
            onMealTypeChange={setMealType}
            onManualLog={handleManualLog}
            onFoodNameChange={setFoodName}
            onSelectSearchResult={(name) => {
              setFoodName(name);
              setSearchResults([]);
            }}
            onQuantityChange={setQuantity}
            onRetryPending={retry}
            onDismissPending={dismiss}
            onDeleteItem={(row) => void handleDelete(row)}
          />
        )}

        {tab === 'recipes' && (
          <LogRecipesTabPanel
            serverOnline={serverOnline}
            loading={loading}
            recipeLoading={recipeLoading}
            recipeScanning={recipeScanning}
            recipePhoto={recipePhoto}
            recipeScanResult={recipeScanResult}
            recipe={recipe}
            recipeSheetsConnected={recipeSheetsConnected}
            onRecipePhotoCapture={(url) => void handleRecipePhoto(url)}
            onRecipeScanSwipe={(dir) => {
              if (dir === 'right') {
                void logRecipeScan(
                  recipeEditName,
                  Number.parseFloat(recipeEditQty) || recipeScanResult!.suggested_grams,
                );
              } else if (dir === 'up' || dir === 'left') {
                setRecipeScanResult(null);
                syncRecipeScanQueue();
                void processRecipeScanQueue();
              }
            }}
            onRecipeEditOpen={() => setRecipeEditOpen(true)}
            onRefreshRecipe={() => void loadSavedRecipe()}
            onLogRecipeItem={(food, quantityG) =>
              void logItem(food, quantityG, (summary) => {
                offerUndo(summary, food, quantityG);
              })
            }
            onLogEntireRecipe={() => {
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
          />
        )}

        {tab === 'mealplan' && (
          <>
            <MealPlanQueueSection
              hasMealPlan={mealPlan.length > 0}
              serverOnline={serverOnline}
              queue={mealPlanQueue}
              syncing={syncingMealPlanQueue}
              syncProgress={mealPlanSyncProgress}
              failedIds={failedMealPlanIds}
              retryingId={retryingMealPlanId}
              scrollToQueueToken={scrollToMealPlanQueue}
              clearAllLabel="Dismiss"
              onSyncAll={() => void flushMealPlanQueue()}
              onRetryFailed={() => void retryFailedMealPlanQueue()}
              onRetry={(item) => void retryMealPlanItem(item)}
              onDismissItem={dismissMealPlanItem}
              onClearAll={() => {
                dismissAllMealPlanQueue();
                syncMealPlanQueue();
                setSuccess('Meal plan log queue cleared');
              }}
            />
            <LogMealPlanTabPanel
              mealPlan={mealPlan}
              loggingMealKey={loggingMealKey}
              loggingMeals={loggingMeals}
              onLogEntry={logMealPlanEntry}
              onLogAll={logAllMealPlan}
              showShortcut
              disableLogAllWhenItemLogging
            />
          </>
        )}

        {tab === 'history' && <LogHistoryPanel days={history?.days ?? []} />}
      </div>

      <LogFoodEditSheet
        open={recipeEditOpen}
        title="Edit recipe scan"
        name={recipeEditName}
        quantity={recipeEditQty}
        onClose={() => setRecipeEditOpen(false)}
        onNameChange={setRecipeEditName}
        onQuantityChange={setRecipeEditQty}
        onSubmit={() => {
          void logRecipeScan(recipeEditName, Number.parseFloat(recipeEditQty));
          setRecipeEditOpen(false);
        }}
      />

      <LogFoodEditSheet
        open={editOpen}
        title="Edit scan"
        name={editName}
        quantity={editQty}
        onClose={() => setEditOpen(false)}
        onNameChange={setEditName}
        onQuantityChange={setEditQty}
        onSubmit={() => {
          void logScan(editName, Number.parseFloat(editQty));
          setEditOpen(false);
        }}
      />

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
