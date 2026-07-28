import { AGENT_QUICK_PROMPTS } from '../lib/agentSectionShared';

interface AgentToolChipsProps {
  disabled?: boolean;
  onSelect: (text: string) => void;
}

export function AgentToolChips({ disabled = false, onSelect }: AgentToolChipsProps) {
  return (
    <div className="agent-tool-chips" role="toolbar" aria-label="Suggested prompts">
      {AGENT_QUICK_PROMPTS.map((tool) => (
        <button
          key={tool.label}
          type="button"
          className="agent-tool-chip"
          disabled={disabled}
          onClick={() => onSelect(tool.text)}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
