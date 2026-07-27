import { FutureSelfBaselineCard } from '../components/FutureSelfBaselineCard';
import { FutureSelfProjectionGrid } from '../components/FutureSelfProjectionGrid';
import { FutureSelfSwipeCard } from '../components/FutureSelfSwipeCard';
import { FutureSelfTrackerCard } from '../components/FutureSelfTrackerCard';
import { useFutureSelfSection } from '../hooks/useFutureSelfSection';

interface FutureSelfProps {
  serverOnline: boolean;
}

export function FutureSelf({ serverOnline }: FutureSelfProps) {
  const {
    cards,
    summary,
    tracker,
    index,
    error,
    loading,
    swipeDir,
    baselinePhoto,
    declineOutcome,
    acceptOutcome,
    generating,
    card,
    handlePhotoCapture,
    generateProjections,
    handleAccept,
    handleDecline,
    updateMetric,
  } = useFutureSelfSection({ serverOnline });

  return (
    <section className="section future-self-section">
      <p className="section-eyebrow">Future Self</p>
      <h1>Future Self</h1>
      <p className="muted">{summary || 'Take a photo, see your two futures, then swipe to decide.'}</p>

      {!serverOnline && (
        <div className="banner banner-warn banner-revolut">Mac server offline — cards unavailable.</div>
      )}

      {error && <div className="banner banner-warn banner-revolut">{error}</div>}

      <FutureSelfBaselineCard
        baselinePhoto={baselinePhoto}
        generating={generating}
        serverOnline={serverOnline}
        onCapture={handlePhotoCapture}
        onGenerate={() => void generateProjections()}
      />

      <FutureSelfProjectionGrid declineOutcome={declineOutcome} acceptOutcome={acceptOutcome} />

      {tracker?.sheets_connected && (
        <FutureSelfTrackerCard
          tracker={tracker}
          onUpdateMetric={(metric, value) => void updateMetric(metric, value)}
        />
      )}

      {card ? (
        <FutureSelfSwipeCard
          card={card}
          swipeDir={swipeDir}
          loading={loading}
          onDecline={handleDecline}
          onAccept={() => void handleAccept()}
        />
      ) : (
        !error &&
        serverOnline && (
          <div className="future-self-card ui-card ui-card--default future-self-card--hinge future-self-swipe-card__empty">
            <p className="section-eyebrow">Prompts</p>
            <p>{cards.length === 0 ? 'Loading cards…' : 'All cards done for today. Great work.'}</p>
          </div>
        )
      )}

      {cards.length > 0 && (
        <p className="muted card-counter">
          {Math.min(index + 1, cards.length)} / {cards.length}
        </p>
      )}
    </section>
  );
}
