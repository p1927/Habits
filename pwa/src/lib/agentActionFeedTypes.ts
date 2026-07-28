export interface AgentAction {
  id: string;
  kind: 'food' | 'calendar';
  message: string;
  at: number;
}
