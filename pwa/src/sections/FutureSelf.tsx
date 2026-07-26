import { useCallback, useEffect, useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { api, ApiError, type FutureSelfCard, type HabitsTodayResponse } from '../lib/api';

interface FutureSelfProps {
  serverOnline: boolean;
}

const METRICS = ['sleep', 'work', 'wasted', 'speak', 'game', 'read'] as const;

interface ProjectionOutcome {
  label: string;
  image_url: string | null;
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
  const [declineOutcome, setDeclineOutcome] = useState<ProjectionOutcome | null>(null);
  const [acceptOutcome, setAcceptOutcome] = useState<ProjectionOutcome | null>(null);
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

  async function handlePhotoCapture(dataUrl: string) {
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
        <div className="banner banner-warn">Mac server offline — cards unavailable.</div>
      )}

      {error && <div className="banner banner-warn">{error}</div>}

      <div className="card">
        <h2>Baseline photo</h2>
        <CameraCapture onCapture={handlePhotoCapture} disabled={generating} />
        {baselinePhoto && (
          <button
            type="button"
            disabled={generating || !serverOnline}
            onClick={() => void generateProjections()}
          >
            {generating ? 'Generating futures…' : 'Show decline vs accept outcomes'}
          </button>
        )}
      </div>

      {(declineOutcome || acceptOutcome) && (
        <div className="projection-grid">
          <div className="projection-card card">
            <p className="projection-label-decline">{declineOutcome?.label ?? 'Decline path'}</p>
            {declineOutcome?.image_url ? (
              <img src={declineOutcome.image_url} alt="Decline future self" />
            ) : (
              <div className="card-image-placeholder">No image</div>
            )}
          </div>
          <div className="projection-card card">
            <p className="projection-label-accept">{acceptOutcome?.label ?? 'Accept path'}</p>
            {acceptOutcome?.image_url ? (
              <img src={acceptOutcome.image_url} alt="Accept future self" />
            ) : (
              <div className="card-image-placeholder">No image</div>
            )}
          </div>
        </div>
      )}

      {tracker?.sheets_connected && (
        <div className="card">
          <h2>Today&apos;s tracker</h2>
          <p className="muted">{tracker.weekday} · {tracker.date}</p>
          <div className="tracker-grid">
            {METRICS.map((m) => (
              <label key={m} className="field tracker-field">
                {m}
                <input
                  type="number"
                  step="0.5"
                  value={tracker.metrics[m] ?? ''}
                  onChange={(e) => void updateMetric(m, e.target.value)}
                  placeholder="h"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {card ? (
        <div className={`swipe-card card ${swipeDir ? `swipe-${swipeDir}` : ''}`}>
          {card.image_url ? (
            <img src={card.image_url} alt="" className="card-image" />
          ) : (
            <div className="card-image card-image-placeholder">✦</div>
          )}
          <h2>{card.title}</h2>
          {card.accept_action && <p className="muted">{card.accept_action}</p>}
          <div className="swipe-actions">
            <button type="button" className="btn-decline" onClick={handleDecline} disabled={loading}>
              Decline
            </button>
            <button type="button" className="btn-accept" onClick={() => void handleAccept()} disabled={loading}>
              Accept
            </button>
          </div>
        </div>
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
