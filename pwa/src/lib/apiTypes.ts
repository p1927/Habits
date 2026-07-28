export interface HealthResponse {
  ok: boolean;
  google_connected?: boolean;
}

export interface SettingsResponse {
  body: Record<string, string | number | null>;
  meal_plan: Record<string, Record<string, string>>;
  notification_times: Record<string, string>;
  sheets_connected: boolean;
}

export interface FoodLogItem {
  row: number;
  food: string;
  quantity_g: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface FoodTodayResponse {
  protein_g: number;
  protein_target_g: number | null;
  calories: number;
  carbs: number;
  fat: number;
  items: FoodLogItem[];
  sheets_connected: boolean;
}

export interface FoodHistoryDay {
  date: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface FoodScanResult {
  detected_name: string;
  confidence: number;
  suggested_grams: number;
  matched_name: string | null;
  macros: { calories: number; carbs: number; protein: number; fat: number } | null;
}

export interface FoodSearchResult {
  name: string;
  ref_grams: number;
  protein: number;
  calories: number;
}

export interface FutureSelfCard {
  id: string;
  title: string;
  habit?: string;
  accept_action?: string;
  decline_action?: string;
  image_url?: string;
  image_prompt?: string;
}

export interface HabitsWeekDay {
  date: string;
  weekday: string;
  metrics: Record<string, number | null>;
}

export interface HabitsWeekResponse {
  days_tracked: number;
  averages: Record<string, number | null>;
  recent_days: HabitsWeekDay[];
}

export interface HabitsStreaksResponse {
  overall: number;
  metrics: Record<string, number>;
  sheets_connected: boolean;
}

export interface HabitsTodayResponse {
  date: string;
  row: number | null;
  weekday: string;
  metrics: Record<string, number | null>;
  notes: string | null;
  sheets_connected: boolean;
}

export interface SicknessTimelineEvent {
  label: string;
  start: string;
  end: string;
}

export interface KeepCard {
  id: string;
  type: 'sickness' | 'notes' | 'strategy';
  title: string;
  body: string;
  color: string;
  row: number;
}

export interface ChatResponse {
  reply: string;
  tool_results: { tool: string; args: Record<string, unknown>; result: unknown }[];
}

export interface VoiceTokenResponse {
  token: string;
  url: string;
  room: string;
  identity: string;
}
