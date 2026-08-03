import type { LogTypeTotalsViewModel } from './logTypeTotalsViewModel';

// logTotalsCoachPrompt — relay-232
//
// Pure helper that builds the plain-text prompt the Agent composer receives
// when the user activates "Ask Coach" from the Log totals strip. Lives in
// lib/ (no React, no DOM, no network) so it is trivially unit-testable and
// can be reused by any caller that already has a LogTypeTotalsViewModel.
//
// Design rationale:
//
// - Plain text only. The composer is a single-line input that strips
//   formatting on submit; multi-line prompts would either get truncated or
//   force the user to scroll. One short paragraph reads cleanly.
// - State-aware copy. The empty / goal-reached / target-unset states each
//   frame the day differently, and the Coach prompt should match — "you
//   hit your goal, what should we do next?" is a different question than
//   "help me plan today's meals". Calling out the comparison (when known)
//   also gives the Coach a concrete number to react to.
// - Never sends. This helper ONLY builds the prompt text. The caller
//   (LogTypeTodayTotalsStrip) hands the text to `onAskCoach`, which
//   navigates to the Agent tab and prefills the composer — the user still
//   presses Enter to send. The AC explicitly forbids auto-send.
// - No target fabrication. When a calorie or protein target is unset, we
//   don't invent one — the prompt says "no calorie target configured"
//   so the Coach doesn't recommend math against a denominator we don't
//   actually have. Same for missing macros (carbs/fat): we simply omit
//   the line rather than writing "0 g carbs".

const EMPTY_PROMPT =
  'I have not logged any meals yet today. Help me plan what to eat.';

const GOAL_REACHED_PROMPT =
  'I hit my calorie goal today. Suggest a light dinner that keeps me on track.';

const TARGET_UNSET_PROMPT =
  'Here is what I have eaten today (no calorie target configured yet). ' +
  'Recommend whether I should set a target and what balance to aim for.';

const TRACKING_PROMPT =
  'Here is what I have eaten today. Recommend how to balance the rest of ' +
  'my day within my target.';

function roundKcal(n: number): string {
  return `${Math.round(n)} kcal`;
}

function roundGrams(n: number): string {
  return `${Math.round(n)} g`;
}

export function buildLogTotalsCoachPrompt(vm: LogTypeTotalsViewModel): string {
  // Empty state: there is nothing to summarise, so prompt the Coach to
  // help plan from a blank slate. This is the only branch that does not
  // include a "Today so far" summary — including zeroed kcal/protein
  // would read as "you ate nothing AND you're asking for advice on it"
  // which is just noise.
  if (vm.hasNoMealsLogged) return EMPTY_PROMPT;

  // The kcal line is always present once meals exist. The target
  // denominator is appended only when the viewmodel considers the target
  // configured (hasCalorieTarget is false for null AND for 0). Saying
  // "750 of 0 kcal" would be nonsensical (relay-226's setupHint case).
  // calorieTarget is echoed back on the viewmodel so we don't need to
  // scrape display strings or re-derive it from percentages.
  const kcalLine =
    vm.hasCalorieTarget && vm.calorieTarget != null
      ? `${roundKcal(vm.consumed)} of ${roundKcal(vm.calorieTarget)}`
      : roundKcal(vm.consumed);

  const proteinLine =
    vm.proteinTarget != null && vm.proteinTarget > 0
      ? `${roundGrams(vm.protein)} of ${roundGrams(vm.proteinTarget)} protein`
      : `${roundGrams(vm.protein)} protein`;

  const macrosLine =
    vm.hasMacros && vm.carbs != null && vm.fat != null
      ? `Macros: ${roundGrams(vm.carbs)} carbs, ${roundGrams(vm.fat)} fat.`
      : '';

  const comparisonLine = vm.comparison.hasYesterday
    ? `Yesterday vs today: ${vm.comparison.kcalDeltaText}; ${vm.comparison.proteinDeltaText}.`
    : '';

  // State-aware framing line: chosen by classifyTotalsState so each
  // totals state asks a question that the Coach can answer concretely.
  const framing =
    vm.state === 'goal-reached'
      ? GOAL_REACHED_PROMPT
      : vm.state === 'target-unset'
        ? TARGET_UNSET_PROMPT
        : TRACKING_PROMPT;

  const summary = [
    `Today so far: ${kcalLine}, ${proteinLine}.`,
    macrosLine,
    comparisonLine,
  ]
    .filter(Boolean)
    .join(' ');

  return `${framing} ${summary}`;
}
