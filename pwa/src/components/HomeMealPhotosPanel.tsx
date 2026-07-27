import { Card } from './ui/Card';
import { MealPhotoGallery } from './MealPhotoGallery';
import type { MealPhoto } from '../lib/mealPhotos';

interface HomeMealPhotosPanelProps {
  photos: MealPhoto[];
}

export function HomeMealPhotosPanel({ photos }: HomeMealPhotosPanelProps) {
  if (photos.length === 0) return null;

  return (
    <Card className="home-meal-photos-card home-export-card--health">
      <p className="section-eyebrow">Gallery</p>
      <h2>Today&apos;s meal photos</h2>
      <p className="muted">From food scans on Log and Coach</p>
      <MealPhotoGallery photos={photos} />
    </Card>
  );
}
