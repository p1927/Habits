export interface RingShareData {
  protein: { value: number; max: number };
  calories: { value: number; max: number };
  habits: { value: number; max: number };
  date?: string;
  streakDays?: number;
}
