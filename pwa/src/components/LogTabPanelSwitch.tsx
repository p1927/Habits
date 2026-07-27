import { LogHistoryPanel } from './LogHistoryPanel';
import { LogMealPlanTabShell } from './LogMealPlanTabShell';
import { LogRecipesTabPanel } from './LogRecipesTabPanel';
import { LogScanTabPanel } from './LogScanTabPanel';
import { LogTypeTabPanel } from './LogTypeTabPanel';
import {
  pickLogMealPlanTabShellProps,
  pickLogRecipesTabPanelProps,
  pickLogScanTabPanelProps,
  pickLogTypeTabPanelProps,
} from '../lib/logTabPanelPropPickers';
import type { LogTabPanelsProps } from '../lib/logTabPanelsProps';

export function LogTabPanelSwitch(props: LogTabPanelsProps) {
  switch (props.tab) {
    case 'scan':
      return <LogScanTabPanel {...pickLogScanTabPanelProps(props)} />;
    case 'type':
      return <LogTypeTabPanel {...pickLogTypeTabPanelProps(props)} />;
    case 'recipes':
      return <LogRecipesTabPanel {...pickLogRecipesTabPanelProps(props)} />;
    case 'mealplan':
      return <LogMealPlanTabShell {...pickLogMealPlanTabShellProps(props)} />;
    case 'history':
      return <LogHistoryPanel days={props.historyDays} />;
    default:
      return null;
  }
}
