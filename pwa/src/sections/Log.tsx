import { useCallback, useRef, useState } from 'react';
import { FoodQueueBanner } from '../components/FoodQueueBanner';
import { LogStatusShell } from '../components/LogStatusShell';
import { LogSubTabs } from '../components/LogSubTabs';
import { LogTabPanels } from '../components/LogTabPanels';
import { MealPlanSyncAwarenessSlot } from '../components/MealPlanSyncAwarenessSlot';
import { RecipeScanQueueSection } from '../components/RecipeScanQueueSection';
import { useLogFoodScan } from '../hooks/useLogFoodScan';
import { useLogFoodUndo, type FoodLogUndoEntry } from '../hooks/useLogFoodUndo';
import { useLogFoodUndoRestore } from '../hooks/useLogFoodUndoRestore';
import { useLogRecipeScan } from '../hooks/useLogRecipeScan';
import { useLogSectionData } from '../hooks/useLogSectionData';
import { useLogTabShortcuts } from '../hooks/useLogTabShortcuts';
import { useLogTypeTab } from '../hooks/useLogTypeTab';
import { useMealPlanShell } from '../hooks/useMealPlanShell';
import { useOptimisticFoodLog } from '../hooks/useOptimisticFoodLog';
import { type LogTab } from '../lib/logSectionShared';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const foodUndoRestoreRef = useRef<(entry: FoodLogUndoEntry) => void>(() => {});
  const onTabRecipesRef = useRef<() => void>(() => {});
  const onTabRecipes = useCallback(() => {
    onTabRecipesRef.current();
  }, []);

  const { data, setData, history, mealPlan } = useLogSectionData({
    serverOnline,
    tab,
    setTab,
    openMealPlan,
    onMealPlanOpened,
    scrollToMealPlanQueue,
    onTabRecipes,
  });

  const { showShortcutHint, dismissShortcutHint } = useLogTabShortcuts(setTab);

  const { pending, logItem, logMeal, logMacros, retry, dismiss, dismissAllQueued, queuedCount, queueSyncClearedToken } = useOptimisticFoodLog({
    serverOnline,
    setData,
    setSuccess,
    setError,
  });

  const {
    undoLog,
    undoing,
    dismissUndo,
    offerUndo,
    handleUndo: handleUndoLog,
  } = useLogFoodUndo({
    serverOnline,
    setData,
    onPendingUndo: () => setSuccess(''),
    setSuccess,
    setError,
    restoreRef: foodUndoRestoreRef,
  });

  const {
    scanResult,
    setScanResult,
    scanPreviewUrl,
    scanHistory,
    editOpen,
    setEditOpen,
    editName,
    setEditName,
    editQty,
    setEditQty,
    handleCapture,
    clearScanFlow,
    restoreScanFromHistory,
    handleClearScanHistory,
    logScan,
  } = useLogFoodScan({ logItem, offerUndo, setLoading, setError });

  const {
    recipe,
    recipeSheetsConnected,
    recipeLoading,
    recipePhoto,
    recipeScanResult,
    setRecipeScanResult,
    recipeScanning,
    recipeEditOpen,
    setRecipeEditOpen,
    recipeEditName,
    setRecipeEditName,
    recipeEditQty,
    setRecipeEditQty,
    recipeScanQueue,
    recipeScanQueueSyncClearedToken,
    loadSavedRecipe,
    syncRecipeScanQueue,
    dismissRecipeScanQueue,
    handleRecipePhoto,
    logRecipeScan,
    logEntireSavedRecipe,
    processRecipeScanQueue,
  } = useLogRecipeScan({
    serverOnline,
    tab,
    setData,
    setLoading,
    logItem,
    offerUndo,
    setError,
    setSuccess,
  });

  onTabRecipesRef.current = () => void loadSavedRecipe();

  const {
    description,
    setDescription,
    mealType,
    setMealType,
    foodName,
    setFoodName,
    quantity,
    setQuantity,
    searchResults,
    offProduct,
    setOffProduct,
    offQuantity,
    setOffQuantity,
    handleVoiceLog,
    handleManualLog,
    handleLogOffProduct,
    handleBarcode,
    handleDelete,
    selectSearchResult,
  } = useLogTypeTab({
    serverOnline,
    logItem,
    logMeal,
    logMacros,
    offerUndo,
    setData,
    setLoading,
    setError,
    setSuccess,
    onSwitchToTypeTab: () => setTab('type'),
  });

  useLogFoodUndoRestore({
    restoreRef: foodUndoRestoreRef,
    setScanResult,
    setEditName,
    setEditQty,
    setRecipeScanResult,
    setRecipeEditName,
    setRecipeEditQty,
    setOffProduct,
    setOffQuantity,
    setFoodName,
    setTab,
  });

  const {
    mealPlanUndo,
    mealPlanUndoing,
    dismissMealPlanUndo,
    handleMealPlanUndo,
    mealPlanQueue,
    syncingMealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
    loggingMealKey,
    loggingMeals,
    logMealPlanEntry,
    logAllMealPlan,
    clearMealPlanQueue,
  } = useMealPlanShell({
    serverOnline,
    syncSource: 'log',
    setMessage: setSuccess,
    setError,
    active: tab === 'mealplan' || tab === 'type',
    watchQueueChanges: true,
    food: data,
    onFoodUpdated: setData,
  });

  const dismissFoodLogQueue = useCallback(() => {
    if (!window.confirm(`Discard ${queuedCount} queued food log${queuedCount === 1 ? '' : 's'}? They will not sync.`)) return;
    dismissAllQueued();
    setSuccess('Offline food log queue cleared');
  }, [dismissAllQueued, queuedCount, setSuccess]);

  return (
    <section className="section log-section" aria-labelledby="log-heading">
      <p className="section-eyebrow">Food log</p>
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

      <LogTabPanels
        tab={tab}
        serverOnline={serverOnline}
        loading={loading}
        scrollToMealPlanQueue={scrollToMealPlanQueue}
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
        offProduct={offProduct}
        offQuantity={offQuantity}
        description={description}
        mealType={mealType}
        foodName={foodName}
        quantity={quantity}
        searchResults={searchResults}
        pending={pending}
        data={data}
        mealPlan={mealPlan}
        loggingMealKey={loggingMealKey}
        loggingMeals={loggingMeals}
        onLogMealPlanEntry={logMealPlanEntry}
        onBarcodeScan={(code) => void handleBarcode(code)}
        onOffQuantityChange={setOffQuantity}
        onLogOffProduct={() => void handleLogOffProduct()}
        onVoiceLog={handleVoiceLog}
        onDescriptionChange={setDescription}
        onMealTypeChange={setMealType}
        onManualLog={handleManualLog}
        onFoodNameChange={setFoodName}
        onSelectSearchResult={selectSearchResult}
        onQuantityChange={setQuantity}
        onRetryPending={retry}
        onDismissPending={dismiss}
        onDeleteItem={(row) => void handleDelete(row)}
        recipeLoading={recipeLoading}
        recipeScanning={recipeScanning}
        recipePhoto={recipePhoto}
        recipeScanResult={recipeScanResult}
        recipe={recipe}
        recipeSheetsConnected={recipeSheetsConnected}
        recipeEditName={recipeEditName}
        recipeEditQty={recipeEditQty}
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
        onLogEntireRecipe={() => void logEntireSavedRecipe()}
        mealPlanQueue={mealPlanQueue}
        syncingMealPlanQueue={syncingMealPlanQueue}
        mealPlanSyncProgress={mealPlanSyncProgress}
        failedMealPlanIds={failedMealPlanIds}
        retryingMealPlanId={retryingMealPlanId}
        onSyncAll={() => void flushMealPlanQueue()}
        onRetryFailed={() => void retryFailedMealPlanQueue()}
        onRetry={(item) => void retryMealPlanItem(item)}
        onDismissItem={dismissMealPlanItem}
        onClearAll={clearMealPlanQueue}
        onLogAll={logAllMealPlan}
        historyDays={history?.days ?? []}
      />

      <LogStatusShell
        success={success}
        error={error}
        undoLog={undoLog}
        undoing={undoing}
        onUndo={() => void handleUndoLog()}
        onDismissUndo={dismissUndo}
        mealPlanUndo={mealPlanUndo}
        mealPlanUndoing={mealPlanUndoing}
        onMealPlanUndo={() => void handleMealPlanUndo(() => setSuccess('Log undone'))}
        onDismissMealPlanUndo={dismissMealPlanUndo}
        editOpen={editOpen}
        editName={editName}
        editQty={editQty}
        onEditClose={() => setEditOpen(false)}
        onEditNameChange={setEditName}
        onEditQtyChange={setEditQty}
        onEditSubmit={() => {
          void logScan(editName, Number.parseFloat(editQty));
          setEditOpen(false);
        }}
        recipeEditOpen={recipeEditOpen}
        recipeEditName={recipeEditName}
        recipeEditQty={recipeEditQty}
        onRecipeEditClose={() => setRecipeEditOpen(false)}
        onRecipeEditNameChange={setRecipeEditName}
        onRecipeEditQtyChange={setRecipeEditQty}
        onRecipeEditSubmit={() => {
          void logRecipeScan(recipeEditName, Number.parseFloat(recipeEditQty));
          setRecipeEditOpen(false);
        }}
      />
    </section>
  );
}
