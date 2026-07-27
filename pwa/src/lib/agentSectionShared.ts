import type { FoodScanResult } from './api';

export const AGENT_QUICK_PROMPTS = [
  { label: 'Log food', text: 'Help me log what I ate today' },
  { label: 'Habits', text: 'How am I doing on habits today?' },
  { label: 'Schedule', text: 'Add a calendar event for tomorrow' },
  { label: 'Health note', text: 'Add a note to my health cards' },
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
