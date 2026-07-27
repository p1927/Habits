import { useCallback, useEffect, useState } from 'react';
import { FutureSelfBaselineCard } from '../components/FutureSelfBaselineCard';
import { FutureSelfProjectionGrid } from '../components/FutureSelfProjectionGrid';
import { FutureSelfSwipeCard } from '../components/FutureSelfSwipeCard';
import { FutureSelfTrackerCard } from '../components/FutureSelfTrackerCard';
import { api, ApiError, type FutureSelfCard, type HabitsTodayResponse } from '../lib/api';
import type { FutureSelfProjectionOutcome } from '../lib/futureSelfSectionShared';

interface FutureSelfProps {
  serverOnline: boolean;
}

export function FutureSelf({ serverOnline }: FutureSelfProps) {
  const [cards, setCards] = useState<FutureSelfCard[]>([]);
  const [summary, setSummary] = useState('');
  const [tracker, setTracker] = useState<HabitsTodayResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [baselinePhoto, setBaselinePhoto] = useState<string | null>(null);
  const [declineOutcome, setDeclineOutcome] = useState<FutureSelfProjectionOutcome | null>(null);
  const [acceptOutcome, setAcceptOutcome] = useState<FutureSelfProjectionOutcome | null>(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!serverOnline) return;
    setError('');
    try {
      const [data, habits] = await Promise.all([
        api.getFutureSelfCards(false),
        api.getHabitsToday(),
      ]);
      setCards(data.cards);
      setSummary(data.summary);
      setTracker(habits);
      setIndex(0);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load cards');
    }
  }, [serverOnline]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateMetric(metric: string, value: string) {
    const num = value === '' ? null : Number.parseFloat(value);
    try {
      const updated = await api.updateHabitMetric(metric, num);
      setTracker(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  }

  function handlePhotoCapture(dataUrl: string) {
    setBaselinePhoto(dataUrl);
    setDeclineOutcome(null);
    setAcceptOutcome(null);
  }

  async function generateProjections() {
    if (!baselinePhoto) return;
    const card = cards[index];
    setGenerating(true);
    setError('');
    try {
      const res = await api.generateFutureSelfProjections(
        baselinePhoto,
        card?.habit ?? card?.id ?? 'general',
      );
      setDeclineOutcome(res.decline_outcome);
      setAcceptOutcome(res.accept_outcome);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate projections');
    } finally {
      setGenerating(false);
    }
  }

  async function handleAccept() {
    const card = cards[index];
    if (!card) return;
    setSwipeDir('right');
    setLoading(true);
    try {
      const res = await api.acceptFutureSelfCard(card.id);
      setSummary(res.summary);
      setTimeout(() => {
        setIndex((i) => i + 1);
        setSwipeDir(null);
        setDeclineOutcome(null);
        setAcceptOutcome(null);
      }, 300);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Accept failed');
      setSwipeDir(null);
    } finally {
      setLoading(false);
    }
  }

  function handleDecline() {
    setSwipeDir('left');
    setTimeout(() => {
      setIndex((i) => i + 1);
      setSwipeDir(null);
      setDeclineOutcome(null);
      setAcceptOutcome(null);
    }, 300);
  }

  const card = cards[index];

  return (
    <section className="section">
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
        !error && serverOnline && (
          <div className="card card-placeholder">
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
