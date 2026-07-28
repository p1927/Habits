import { useCallback, useEffect, useState } from 'react';
import type { MealPhoto } from '../lib/mealPhotos';

interface MealPhotoGalleryProps {
  photos: MealPhoto[];
}

export function MealPhotoGallery({ photos }: MealPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex != null ? photos[activeIndex] : null;

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((i) => (i == null || i <= 0 ? i : i - 1));
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((i) => (i == null || i >= photos.length - 1 ? i : i + 1));
  }, [photos.length]);

  useEffect(() => {
    if (activeIndex == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeIndex, close, showNext, showPrev]);

  if (!photos.length) return null;

  return (
    <>
      <div className="meal-photo-gallery" role="list" aria-label="Today's meal photos">
        {photos.map((photo, index) => (
          <figure key={photo.id} className="meal-photo-thumb" role="listitem">
            <button
              type="button"
              className="meal-photo-thumb-btn"
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${photo.label}`}
            >
              <img src={photo.dataUrl} alt="" loading="lazy" />
            </button>
            <figcaption>{photo.label}</figcaption>
          </figure>
        ))}
      </div>

      {active && activeIndex != null && (
        <div
          className="meal-photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.label}
          onClick={close}
        >
          <div className="meal-photo-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="meal-photo-lightbox-close" onClick={close} aria-label="Close">
              ×
            </button>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="meal-photo-lightbox-nav meal-photo-lightbox-nav--prev"
                  onClick={showPrev}
                  disabled={activeIndex <= 0}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="meal-photo-lightbox-nav meal-photo-lightbox-nav--next"
                  onClick={showNext}
                  disabled={activeIndex >= photos.length - 1}
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}
            <img src={active.dataUrl} alt={active.label} className="meal-photo-lightbox-img" />
            <p className="meal-photo-lightbox-caption">{active.label}</p>
            {photos.length > 1 && (
              <p className="meal-photo-lightbox-counter">
                {activeIndex + 1} / {photos.length}
              </p>
            )}
            <p className="muted meal-photo-lightbox-hint">Press Escape to close</p>
          </div>
        </div>
      )}
    </>
  );
}
