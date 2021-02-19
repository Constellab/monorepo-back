import {constBiotaFullRoute, constBioxFullRoute} from '../../core/utils/base-route';
import {technicalBricks} from './technical-brick.class';

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
    label: technicalBricks.BIOX.label,
    icon: technicalBricks.BIOX.icon,
    route: constBioxFullRoute
  },
  {
    label: technicalBricks.BIOTA.label,
    icon: technicalBricks.BIOTA.icon,
    route: constBiotaFullRoute
  },
  {
    label: 'add_brick',
    icon: 'view_in_ar',
    route: '/app/brick'
  }
];
