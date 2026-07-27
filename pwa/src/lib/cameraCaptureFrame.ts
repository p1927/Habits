export function stopMediaStream(stream: MediaStream | null) {
  for (const track of stream?.getTracks() ?? []) track.stop();
}

export function captureVideoFrame(video: HTMLVideoElement, quality = 0.85): string | null {
  if (video.videoWidth === 0 || video.videoHeight === 0) return null;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', quality);
}

export function readImageFileAsDataUrl(
  file: File,
  onLoad: (dataUrl: string) => void,
  onError: (message: string) => void,
) {
  const reader = new FileReader();
  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : null;
    if (result) onLoad(result);
  };
  reader.onerror = () => onError('Could not read that image file');
  reader.readAsDataURL(file);
}
