export { ApiError } from './apiClient';
export type {
  ChatResponse,
  FoodHistoryDay,
  FoodLogItem,
  FoodScanResult,
  FoodSearchResult,
  FoodTodayResponse,
  FutureSelfCard,
  HabitsStreaksResponse,
  HabitsTodayResponse,
  HabitsWeekDay,
  HabitsWeekResponse,
  HealthResponse,
  KeepCard,
  SettingsResponse,
  SicknessTimelineEvent,
  VoiceTokenResponse,
} from './apiTypes';

import { agentApi } from './apiAgent';
import { calendarApi } from './apiCalendar';
import { cardsApi } from './apiCards';
import { dayApi } from './apiDay';
import { foodApi } from './apiFood';
import { futureSelfApi } from './apiFutureSelf';
import { habitsApi } from './apiHabits';
import { settingsApi } from './apiSettings';

export const api = {
  ...settingsApi,
  ...foodApi,
  ...futureSelfApi,
  ...habitsApi,
  ...calendarApi,
  ...dayApi,
  ...cardsApi,
  ...agentApi,
};
