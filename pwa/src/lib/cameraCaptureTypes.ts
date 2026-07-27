export interface UseCameraCaptureOptions {
  onCapture: (dataUrl: string) => void;
  disabled?: boolean;
  facingMode?: 'user' | 'environment';
}
