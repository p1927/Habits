export const SETTINGS_NOTIFICATION_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  mid_day_snack: 'Mid-day snack',
  lunch: 'Lunch',
  evening_snack: 'Evening snack',
  late_evening_snack: 'Late evening snack',
  dinner: 'Dinner',
  late_night_snack: 'Late night snack',
  bedtime: 'Bedtime',
};

export const SETTINGS_MEAL_PLAN_KEYS = [
  'breakfast',
  'mid_day_snack',
  'lunch',
  'evening_snack',
  'late_evening_snack',
  'dinner',
  'late_night_snack',
] as const;

export const SETTINGS_WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export function settingsMealLabel(key: string): string {
  return SETTINGS_NOTIFICATION_LABELS[key] ?? key.replace(/_/g, ' ');
}

export function formatSettingsFieldLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Human-label checklist for the OAuth scopes panel (ui-069).
// Wording mirrors Google's own consent screen — "See, edit, create, and
// delete your spreadsheets/calendars" — so users recognise the grant that
// the Settings card is describing.
export const GOOGLE_SCOPE_LABELS: Record<string, string> = {
  'https://www.googleapis.com/auth/spreadsheets':
    'See, edit, create, and delete your spreadsheets',
  'https://www.googleapis.com/auth/calendar':
    'See, edit, create, and delete your calendars',
};

// The two scopes Habits actually requests (kept here so the Settings UI can
// render the full checklist with Not-granted pills, not just show granted).
export const GOOGLE_REQUESTED_SCOPES: readonly string[] = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar',
] as const;

export function googleScopeLabel(scope: string): string {
  return GOOGLE_SCOPE_LABELS[scope] ?? scope;
}
