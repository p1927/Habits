import { useCallback, useState } from 'react';
import { api } from '../lib/api';
import { addMealPhoto, getRecentMealPhotos, type MealPhoto } from '../lib/mealPhotos';
import { dataUrlToFile } from '../lib/logSectionShared';
import { foodScanChatSummary } from '../lib/agentSectionShared';

interface UseAgentPhotoAttachOptions {
  setAttachImage: (url: string | null) => void;
  setInput: (text: string) => void;
  setError: (msg: string) => void;
}

export function useAgentPhotoAttach({
  setAttachImage,
  setInput,
  setError,
}: UseAgentPhotoAttachOptions) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [recentPhotos, setRecentPhotos] = useState<MealPhoto[]>(() => getRecentMealPhotos(8));
  const [scanning, setScanning] = useState(false);

  const handlePhotoCapture = useCallback(async (dataUrl: string, label?: string) => {
    setCameraOpen(false);
    setScanning(true);
    setError('');
    try {
      const scan = await api.scanFood(dataUrlToFile(dataUrl, 'chat-scan.jpg'));
      setAttachImage(dataUrl);
      setInput(foodScanChatSummary(scan));
      addMealPhoto(dataUrl, scan.matched_name ?? scan.detected_name);
      setRecentPhotos(getRecentMealPhotos(8));
    } catch (e) {
      setAttachImage(dataUrl);
      setInput(label ? `I attached ${label} — please help me log it.` : 'I attached a food photo — please help me log it.');
      setError(e instanceof Error ? e.message : 'Food scan failed');
      if (label) addMealPhoto(dataUrl, label);
      setRecentPhotos(getRecentMealPhotos(8));
    } finally {
      setScanning(false);
    }
  }, [setAttachImage, setInput, setError]);

  return {
    cameraOpen,
    setCameraOpen,
    attachOpen,
    setAttachOpen,
    recentPhotos,
    scanning,
    handlePhotoCapture,
  };
}
