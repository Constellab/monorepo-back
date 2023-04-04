import {
  labConstBiotaFullRoute,
  labConstBioxFullRoute,
  labConstDataboxFullRoute,
  labConstReportFullRoute,
  labConstViewboxFullRoute
} from '../lab-core/utils/lab-base-route';

/**
 * Describe one main menu link button
 */
export interface MainMenuLink {
  route: string;
  label: string;
  icon: string;
  divider?: boolean;
}

// list of the main menu links buttons
export const mainMenuLinks: MainMenuLink[] = [
  {
    label: 'biox.biox',
    icon: 'experiment',
    route: labConstBioxFullRoute
  },
  {
    label: 'databox.file_explorer',
    icon: 'folder',
    route: labConstDataboxFullRoute
  },
  {
    label: 'biox.viewbox',
    icon: 'view',
    route: labConstViewboxFullRoute
  },
  {
    label: 'biox.reports',
    icon: 'report',
    route: labConstReportFullRoute
  },
];

export const labBiotaMenuLink: MainMenuLink = {
  label: 'biota.biota',
  icon: 'database',
  route: labConstBiotaFullRoute,
  divider: true,
};
