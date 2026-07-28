import { BottomSheet } from './ui/BottomSheet';
import { AGENT_TOOLS } from '../lib/agentSectionShared';

interface AgentToolsSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (text: string) => void;
  loading?: boolean;
  serverOnline?: boolean;
}

export function AgentToolsSheet({
  open,
  onClose,
  onSelect,
  loading = false,
  serverOnline = true,
}: AgentToolsSheetProps) {
  const rowsDisabled = loading || !serverOnline;

  return (
    <BottomSheet open={open} onClose={onClose} title="Tools">
      {!serverOnline && (
        <p className="banner banner-warn banner-revolut agent-tools-offline" role="status">
          Connect to the Habits server to use tools.
        </p>
      )}
      <ul className="agent-tools-list" aria-label="Coach tools">
        {AGENT_TOOLS.map((tool) => (
          <li key={tool.label}>
            <button
              type="button"
              className="agent-tools-row"
              disabled={rowsDisabled}
              aria-disabled={rowsDisabled}
              onClick={() => {
                if (rowsDisabled) return;
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
