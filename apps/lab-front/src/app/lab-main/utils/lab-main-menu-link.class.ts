import {
  labConstBiotaFullRoute,
  labConstBioxFullRoute,
  labConstDataboxFullRoute
} from '../../lab-core/utils/lab-base-route';
import {technicalBricks} from './lab-technical-brick.class';

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
    route: labConstBioxFullRoute
  },
  {
    label: technicalBricks.BIOTA.label,
    icon: technicalBricks.BIOTA.icon,
    route: labConstBiotaFullRoute
  },
  {
    label: 'databox.file_explorer',
    icon: 'folder',
    route: labConstDataboxFullRoute
  },
  // {
  //   label: 'add_brick',
  //   icon: 'view_in_ar',
  //   route: '/app/brick'
  // }
];
