import { BottomSheet } from './ui/BottomSheet';
import { AGENT_TOOLS } from '../lib/agentSectionShared';

interface AgentToolsSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (text: string) => void;
}

export function AgentToolsSheet({ open, onClose, onSelect }: AgentToolsSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Tools">
      <ul className="agent-tools-list" aria-label="Coach tools">
        {AGENT_TOOLS.map((tool) => (
          <li key={tool.label}>
            <button
              type="button"
              className="agent-tools-row"
              onClick={() => {
                onSelect(tool.text);
                onClose();
              }}
            >
              <span className="agent-tools-row__label">{tool.label}</span>
              <span className="agent-tools-row__desc">{tool.description}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="muted agent-tools-sheet-hint">Press Escape to close</p>
    </BottomSheet>
  );
}
