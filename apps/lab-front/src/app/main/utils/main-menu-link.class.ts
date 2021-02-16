import {constBiotaFullRoute, constBioxFullRoute} from '../../core/utils/base-route';

/**
 * Describe one main menu link button
 */
export interface MainMenuLink {
  route: string;
  label: string;
  icon: string;
}

// list of the main menu links buttons
export const mainMenuLinks: MainMenuLink[] = [
  {
    label: 'biox.biox',
    icon: 'vials',
    route: constBioxFullRoute
  },
  {
    label: 'biota.biota',
    icon: 'database',
    route: constBiotaFullRoute
  }
];
