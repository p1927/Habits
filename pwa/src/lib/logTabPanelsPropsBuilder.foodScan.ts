import type { FoodScan } from './logTabPanelsPropsBuilder';

export interface BuildFoodScanPropsInput {
  foodScan: FoodScan;
  loading: boolean;
  scrollToFoodQueue?: number;
}

export function buildFoodScanProps({
  foodScan,
  loading,
  scrollToFoodQueue,
}: BuildFoodScanPropsInput) {
  return {
    loading,
    scrollToFoodQueue,
    scanPreviewUrl: foodScan.scanPreviewUrl,
    scanResult: foodScan.scanResult,
    scanHistory: foodScan.scanHistory,
    editName: foodScan.editName,
    editQty: foodScan.editQty,
    onCapture: (url: string) => void foodScan.handleCapture(url),
    onClearScan: foodScan.clearScanFlow,
    onRestoreScan: foodScan.restoreScanFromHistory,
    onClearScanHistory: foodScan.handleClearScanHistory,
    onEditOpen: () => foodScan.setEditOpen(true),
    onLogScan: (name: string, qty: number) => void foodScan.logScan(name, qty),
  };
}
