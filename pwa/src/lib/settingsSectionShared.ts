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
