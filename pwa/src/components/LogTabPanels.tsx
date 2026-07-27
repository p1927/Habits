import { LogHistoryPanel } from './LogHistoryPanel';
import { LogMealPlanTabShell } from './LogMealPlanTabShell';
import { LogRecipesTabPanel } from './LogRecipesTabPanel';
import { LogScanTabPanel } from './LogScanTabPanel';
import { LogTypeTabPanel } from './LogTypeTabPanel';
import type { FoodScanResult, FoodSearchResult, FoodTodayResponse } from '../lib/api';
import { type LogTab } from '../lib/logSectionShared';
import type { MealPlanEntry, QueuedMealPlanLog } from '../lib/mealPlanQueue';
import type { OptimisticFoodEntry } from '../lib/optimisticFoodLog';
import type { OffProduct } from '../lib/openFoodFacts';
import type { ScanHistoryEntry } from '../lib/scanHistory';
import type { SavedRecipe } from './LogRecipesTabPanel';
import type { SwipeDirection } from './ui/SwipeStack';

interface LogTabPanelsProps {
  tab: LogTab;
  serverOnline: boolean;
  loading: boolean;
  scrollToMealPlanQueue?: number;
  scanPreviewUrl: string | null;
  scanResult: FoodScanResult | null;
  scanHistory: ScanHistoryEntry[];
  editName: string;
  editQty: string;
  onCapture: (url: string) => void;
  onClearScan: () => void;
  onRestoreScan: (entry: ScanHistoryEntry) => void;
  onClearScanHistory: () => void;
  onEditOpen: () => void;
  onLogScan: (name: string, qty: number) => void;
  offProduct: OffProduct | null;
  offQuantity: string;
  description: string;
  mealType: string;
  foodName: string;
  quantity: string;
  searchResults: FoodSearchResult[];
  pending: OptimisticFoodEntry[];
  data: FoodTodayResponse | null;
  mealPlan: MealPlanEntry[];
  loggingMealKey: string | null;
  loggingMeals: boolean;
  onLogMealPlanEntry: (entry: MealPlanEntry) => void;
  onBarcodeScan: (code: string) => void;
  onOffQuantityChange: (value: string) => void;
  onLogOffProduct: () => void;
  onVoiceLog: (e: React.FormEvent) => void;
  onDescriptionChange: (value: string) => void;
  onMealTypeChange: (value: string) => void;
  onManualLog: (e: React.FormEvent) => void;
  onFoodNameChange: (value: string) => void;
  onSelectSearchResult: (name: string) => void;
  onQuantityChange: (value: string) => void;
  onRetryPending: (entry: OptimisticFoodEntry) => void;
  onDismissPending: (id: string) => void;
  onDeleteItem: (row: number) => void;
  recipeLoading: boolean;
  recipeScanning: boolean;
  recipePhoto: string | null;
  recipeScanResult: FoodScanResult | null;
  recipe: SavedRecipe | null;
  recipeSheetsConnected: boolean | null;
  recipeEditName: string;
  recipeEditQty: string;
  onRecipePhotoCapture: (url: string) => void;
  onRecipeScanSwipe: (dir: SwipeDirection) => void;
  onRecipeEditOpen: () => void;
  onRefreshRecipe: () => void;
  onLogRecipeItem: (food: string, quantityG: number) => void;
  onLogEntireRecipe: () => void;
  mealPlanQueue: QueuedMealPlanLog[];
  syncingMealPlanQueue: boolean;
  mealPlanSyncProgress: { done: number; total: number } | null;
  failedMealPlanIds: Set<string>;
  retryingMealPlanId: string | null;
  onSyncAll: () => void;
  onRetryFailed: () => void;
  onRetry: (item: QueuedMealPlanLog) => void;
  onDismissItem: (id: string) => void;
  onClearAll: () => void;
  onLogAll: () => void;
  historyDays: { date: string; calories: number; protein: number }[];
}

export function LogTabPanels({
  tab,
  serverOnline,
  loading,
  scrollToMealPlanQueue,
  scanPreviewUrl,
  scanResult,
  scanHistory,
  editName,
  editQty,
  onCapture,
  onClearScan,
  onRestoreScan,
  onClearScanHistory,
  onEditOpen,
  onLogScan,
  offProduct,
  offQuantity,
  description,
  mealType,
  foodName,
  quantity,
  searchResults,
  pending,
  data,
  mealPlan,
  loggingMealKey,
  loggingMeals,
  onLogMealPlanEntry,
  onBarcodeScan,
  onOffQuantityChange,
  onLogOffProduct,
  onVoiceLog,
  onDescriptionChange,
  onMealTypeChange,
  onManualLog,
  onFoodNameChange,
  onSelectSearchResult,
  onQuantityChange,
  onRetryPending,
  onDismissPending,
  onDeleteItem,
  recipeLoading,
  recipeScanning,
  recipePhoto,
  recipeScanResult,
  recipe,
  recipeSheetsConnected,
  onRecipePhotoCapture,
  onRecipeScanSwipe,
  onRecipeEditOpen,
  onRefreshRecipe,
  onLogRecipeItem,
  onLogEntireRecipe,
  mealPlanQueue,
  syncingMealPlanQueue,
  mealPlanSyncProgress,
  failedMealPlanIds,
  retryingMealPlanId,
  onSyncAll,
  onRetryFailed,
  onRetry,
  onDismissItem,
  onClearAll,
  onLogAll,
  historyDays,
}: LogTabPanelsProps) {
  return (
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
          onCapture={onCapture}
          onClearScan={onClearScan}
          onRestoreScan={onRestoreScan}
          onClearScanHistory={onClearScanHistory}
          onEditOpen={onEditOpen}
          onLogScan={onLogScan}
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
          mealPlan={mealPlan}
          loggingMealKey={loggingMealKey}
          onLogMealPlanEntry={onLogMealPlanEntry}
          onBarcodeScan={onBarcodeScan}
          onOffQuantityChange={onOffQuantityChange}
          onLogOffProduct={onLogOffProduct}
          onVoiceLog={onVoiceLog}
          onDescriptionChange={onDescriptionChange}
          onMealTypeChange={onMealTypeChange}
          onManualLog={onManualLog}
          onFoodNameChange={onFoodNameChange}
          onSelectSearchResult={onSelectSearchResult}
          onQuantityChange={onQuantityChange}
          onRetryPending={onRetryPending}
          onDismissPending={onDismissPending}
          onDeleteItem={onDeleteItem}
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
          onRecipePhotoCapture={onRecipePhotoCapture}
          onRecipeScanSwipe={onRecipeScanSwipe}
          onRecipeEditOpen={onRecipeEditOpen}
          onRefreshRecipe={onRefreshRecipe}
          onLogRecipeItem={onLogRecipeItem}
          onLogEntireRecipe={onLogEntireRecipe}
        />
      )}

      {tab === 'mealplan' && (
        <LogMealPlanTabShell
          mealPlan={mealPlan}
          serverOnline={serverOnline}
          mealPlanQueue={mealPlanQueue}
          syncingMealPlanQueue={syncingMealPlanQueue}
          mealPlanSyncProgress={mealPlanSyncProgress}
          failedMealPlanIds={failedMealPlanIds}
          retryingMealPlanId={retryingMealPlanId}
          scrollToMealPlanQueue={scrollToMealPlanQueue}
          loggingMealKey={loggingMealKey}
          loggingMeals={loggingMeals}
          onSyncAll={onSyncAll}
          onRetryFailed={onRetryFailed}
          onRetry={onRetry}
          onDismissItem={onDismissItem}
          onClearAll={onClearAll}
          onLogEntry={onLogMealPlanEntry}
          onLogAll={onLogAll}
        />
      )}

      {tab === 'history' && <LogHistoryPanel days={historyDays} />}
    </div>
  );
}
