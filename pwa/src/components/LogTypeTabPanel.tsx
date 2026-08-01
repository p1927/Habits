import { BarcodeScanner } from './BarcodeScanner';
import { LogManualEntryForm } from './LogManualEntryForm';
import { LogOffProductCard } from './LogOffProductCard';
import { LogTypeTodayList } from './LogTypeTodayList';
import { LogTypeTodayTotalsStrip } from './LogTypeTodayTotalsStrip';
import { LogVoiceQuickForm } from './LogVoiceQuickForm';
import { Card } from './ui/Card';
import { MealPlanQuickAddBar } from './MealPlanQuickAddBar';
import type { FoodSearchResult, FoodTodayResponse } from '../lib/api';
import type { OptimisticFoodEntry } from '../hooks/useOptimisticFoodLog';
import type { MealPlanEntry } from '../lib/mealPlanQueue';
import type { OffProduct } from '../lib/openFoodFacts';

export interface LogTypeTabPanelProps {
  serverOnline: boolean;
  loading: boolean;
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
  scrollToFoodQueue?: number;
}

export function LogTypeTabPanel({
  serverOnline,
  loading,
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
  scrollToFoodQueue,
}: LogTypeTabPanelProps) {
  return (
    <>
      <MealPlanQuickAddBar
        meals={mealPlan}
        loggingMealKey={loggingMealKey}
        serverOnline={serverOnline}
        onLogEntry={onLogMealPlanEntry}
      />

      <Card className="log-type-card home-export-card--health">
        <p className="section-eyebrow">Scan</p>
        <h2>Barcode</h2>
        <p className="muted">Scan packaged food — looks up your sheet, then Open Food Facts</p>
        <BarcodeScanner disabled={loading} onScan={onBarcodeScan} />
      </Card>

      {offProduct && (
        <LogOffProductCard
          offProduct={offProduct}
          offQuantity={offQuantity}
          loading={loading}
          onOffQuantityChange={onOffQuantityChange}
          onLogOffProduct={onLogOffProduct}
        />
      )}

      <LogVoiceQuickForm
        serverOnline={serverOnline}
        loading={loading}
        description={description}
        mealType={mealType}
        onDescriptionChange={onDescriptionChange}
        onMealTypeChange={onMealTypeChange}
        onVoiceLog={onVoiceLog}
      />

      <LogManualEntryForm
        serverOnline={serverOnline}
        loading={loading}
        foodName={foodName}
        quantity={quantity}
        searchResults={searchResults}
        onFoodNameChange={onFoodNameChange}
        onSelectSearchResult={onSelectSearchResult}
        onQuantityChange={onQuantityChange}
        onManualLog={onManualLog}
      />

      <LogTypeTodayTotalsStrip data={data} serverOnline={serverOnline} />

      <LogTypeTodayList
        pending={pending}
        data={data}
        onRetryPending={onRetryPending}
        onDismissPending={onDismissPending}
        onDeleteItem={onDeleteItem}
        scrollToFoodQueue={scrollToFoodQueue}
      />
    </>
  );
}
