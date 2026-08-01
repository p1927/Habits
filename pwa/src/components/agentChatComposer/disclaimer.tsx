import { shortcutModifierLabel } from '../../lib/logSectionShared';

export function AgentComposerDisclaimer() {
  return (
    <p className="agent-composer-disclaimer muted">
      Coach can make mistakes — double-check food and calendar changes. Press{' '}
      <kbd>{shortcutModifierLabel()}K</kbd> to focus the composer.
    </p>
  );
}
