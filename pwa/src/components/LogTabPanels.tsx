import { LogTabPanelSwitch } from './LogTabPanelSwitch';
import type { LogTabPanelsProps } from '../lib/logTabPanelsProps';

export type { LogTabPanelsProps } from '../lib/logTabPanelsProps';

export function LogTabPanels(props: LogTabPanelsProps) {
  return (
    <div role="tabpanel" id={`log-panel-${props.tab}`} aria-labelledby={`log-tab-${props.tab}`}>
      <LogTabPanelSwitch {...props} />
    </div>
  );
}
