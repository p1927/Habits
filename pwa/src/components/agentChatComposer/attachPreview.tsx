export interface AgentComposerAttachPreviewProps {
  attachImage: string;
  onClear: () => void;
}

export function AgentComposerAttachPreview({ attachImage, onClear }: AgentComposerAttachPreviewProps) {
  return (
    <div className="agent-attach-preview">
      <img src={attachImage} alt="Attached food photo" className="agent-attach-thumb" />
      <button type="button" className="btn-pill btn-pill-outline" onClick={onClear}>
        Remove
      </button>
    </div>
  );
}
