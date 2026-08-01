import { toolStatusLabel } from '../../lib/agentToolStatus';

export interface AgentComposerStatusChipsProps {
  loading: boolean;
  activeTools: string[];
  toolStatusLabels: string[];
}

export function AgentComposerStatusChips({
  loading,
  activeTools,
  toolStatusLabels,
}: AgentComposerStatusChipsProps) {
  const toolLabels = activeTools.length > 0
    ? activeTools.reduce<string[]>((labels, tool) => {
        const label = toolStatusLabel(tool);
        if (labels.includes(label)) return labels;
        return [...labels, label];
      }, [])
    : toolStatusLabels;
  const chips = toolLabels.length > 0 ? toolLabels : loading ? ['Working…'] : [];
  if (chips.length === 0) return null;
  return (
    <div className="agent-tool-status" role="status" aria-live="polite" aria-label="Coach activity">
      {chips.map((label, i) => (
        <span key={`${label}-${i}`} className="agent-tool-status__chip">
          {label}
        </span>
      ))}
    </div>
  );
}
