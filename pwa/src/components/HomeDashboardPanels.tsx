import { HomeDashboardFeedPanels } from './HomeDashboardFeedPanels';
import { HomeDashboardMetricsPanels } from './HomeDashboardMetricsPanels';
import type { HomeDashboardPanelsProps } from '../lib/homeDashboardPanelsTypes';

export type { HomeDashboardPanelsProps } from '../lib/homeDashboardPanelsTypes';

export function HomeDashboardPanels(props: HomeDashboardPanelsProps) {
  return (
    <>
      <HomeDashboardMetricsPanels {...props} />
      <HomeDashboardFeedPanels {...props} />
    </>
  );
}
