import type { FoodScanResult } from './api';

export const AGENT_QUICK_PROMPTS = [
  { label: 'Log food', text: 'Help me log what I ate today' },
  { label: 'Habits', text: 'How am I doing on habits today?' },
  { label: 'Schedule', text: 'Add a calendar event for tomorrow' },
  { label: 'Health note', text: 'Add a note to my health cards' },
] as const;

/** Prefill when Day schedule is empty — opens Agent with this message. */
export const AGENT_SCHEDULE_TODAY_PROMPT = 'Add a calendar event for today';

export const AGENT_GREETING_CATEGORIES = [
  { label: 'Log food', icon: '◉', description: 'Track meals, macros, and portions', text: 'Help me log what I ate today' },
  { label: 'Habits', icon: '☰', description: 'Sleep, work, and daily targets', text: 'How am I doing on habits today?' },
  { label: 'Schedule', icon: '⌁', description: 'Calendar events and your day', text: 'What is on my calendar today?' },
  { label: 'Health note', icon: '✎', description: 'Notes, sickness, or strategy cards', text: 'Add a note to my health cards' },
] as const;

export const AGENT_TOOLS = [
  { label: 'Log food', description: 'Track meals, macros, and portions', text: 'Help me log what I ate today' },
  { label: 'Habit check-in', description: 'Review sleep, work, and daily targets', text: 'How am I doing on habits today?' },
  { label: 'Calendar', description: 'Schedule events and review your day', text: 'Add a calendar event for tomorrow' },
  { label: 'Health cards', description: 'Capture notes, sickness, or strategy', text: 'Add a note to my health cards' },
  { label: 'Meal plan', description: 'Sync or adjust today\'s meal plan', text: 'Help me with my meal plan for today' },
  { label: 'Weekly summary', description: 'Nutrition and habit trends', text: 'Summarize my week — food and habits' },
] as const;

export type AgentChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
};

export function foodScanChatSummary(scan: FoodScanResult): string {
  const name = scan.matched_name ?? scan.detected_name;
  const macros = scan.macros;
  const macroText = macros
    ? ` — ${macros.calories.toFixed(0)} kcal, ${macros.protein.toFixed(1)}g protein`
    : '';
  return `Log this food from my photo: ${name}, ${scan.suggested_grams}g${macroText}`;
}
