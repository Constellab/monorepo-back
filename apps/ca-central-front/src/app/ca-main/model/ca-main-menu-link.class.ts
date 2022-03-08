import {
  caConstAdminRoute,
  caConstDashboardFullRoute,
  caConstLabInstancesFullRoute,
  caConstProjectsFullRoute,
  caConstSettingsFullRoute,
  caConstSmartDbRoute
} from '../../ca-core/utils/ca-base-route';
import {CmUserCategory} from '@monorepo/common-model';

/**
 * Describe one main menu link button
 */
export interface CaMainMenuLink {
  route: string;
  label: string;
  icon: string;
  authorizedCategories?: CmUserCategory[];
}

// list of the main menu links buttons
export const caMainMenuLinks: CaMainMenuLink[] = [
  {
    label: 'dashboard',
    icon: 'dashboard',
    route: caConstDashboardFullRoute
  },
  {
    label: 'my_projects',
    icon: 'project',
    route: caConstProjectsFullRoute
  },
  {
    label: 'my_labs',
    icon: 'lab',
    route: caConstLabInstancesFullRoute
  },
  {
    label: 'my_smart_db',
    icon: 'smart_db',
    route: caConstSmartDbRoute
  },
  {
    label: 'admin_dashboard',
    icon: 'admin_panel_settings',
    route: caConstAdminRoute,
    authorizedCategories: [CmUserCategory.ADMIN]
  },
  {
    label: 'settings',
    icon: 'settings',
    route: caConstSettingsFullRoute
  }
];
