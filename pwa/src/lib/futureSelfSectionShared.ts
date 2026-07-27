export const FUTURE_SELF_METRICS = ['sleep', 'work', 'wasted', 'speak', 'game', 'read'] as const;

export interface FutureSelfProjectionOutcome {
  label: string;
  image_url: string | null;
}
