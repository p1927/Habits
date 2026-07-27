import { useCallback, useState } from 'react';
import { api, type FoodScanResult, type FoodTodayResponse } from '../lib/api';
import { addMealPhoto } from '../lib/mealPhotos';
import {
  addScanHistory,
  clearScanHistory,
  getScanHistory,
  type ScanHistoryEntry,
} from '../lib/scanHistory';
import { dataUrlToFile } from '../lib/logSectionShared';

export type LogFoodUndoRestore = {
  scan?: FoodScanResult | null;
  recipeScan?: FoodScanResult | null;
  offProduct?: import('../lib/openFoodFacts').OffProduct | null;
  editName: string;
  editQty: string;
  offQuantity?: string;
};

interface UseLogFoodScanOptions {
  logItem: (
    food: string,
    qty: number,
    onSuccess?: (summary: FoodTodayResponse) => void,
  ) => Promise<void>;
  offerUndo: (
    summary: FoodTodayResponse,
    food: string,
    qty: number,
    restore?: LogFoodUndoRestore,
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (msg: string) => void;
}

export function useLogFoodScan({ logItem, offerUndo, setLoading, setError }: UseLogFoodScanOptions) {
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState(() => getScanHistory());
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('100');

  const clearScanFlow = useCallback(() => {
    setScanResult(null);
    setScanPreviewUrl(null);
  }, []);

  const handleCapture = useCallback(
    async (dataUrl: string) => {
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
    },
    [setLoading, setError],
  );

  const restoreScanFromHistory = useCallback((entry: ScanHistoryEntry) => {
    setScanPreviewUrl(entry.imageUrl);
    setScanResult(entry.scan);
    setEditName(entry.scan.matched_name ?? entry.scan.detected_name);
    setEditQty(String(entry.scan.suggested_grams));
    setError('');
  }, [setError]);

  const handleClearScanHistory = useCallback(() => {
    clearScanHistory();
    setScanHistory([]);
  }, []);

  const logScan = useCallback(
    async (name: string, qty: number) => {
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
    },
    [scanResult, editName, editQty, clearScanFlow, logItem, offerUndo],
  );

  return {
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
  };
}
