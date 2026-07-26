import type { MealPhoto } from '../lib/mealPhotos';

interface MealPhotoGalleryProps {
  photos: MealPhoto[];
}

export function MealPhotoGallery({ photos }: MealPhotoGalleryProps) {
  if (!photos.length) return null;

  return (
    <div className="meal-photo-gallery" role="list" aria-label="Today's meal photos">
      {photos.map((photo) => (
        <figure key={photo.id} className="meal-photo-thumb" role="listitem">
          <img src={photo.dataUrl} alt={photo.label} loading="lazy" />
          <figcaption>{photo.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
