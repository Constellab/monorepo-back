/**
 * Describe one main menu link button
 */
import {
  constAdminRoute,
  constDashboardFullRoute,
  constLabInstancesFullRoute,
  constLabsConfig,
  constProjectsFullRoute,
  constProtocolsRoute,
  constSettingsFullRoute
} from '../../core/utils/base-route';
import {CmUserCategory} from '@monorepo/common-model';

export interface MainMenuLink {
  route: string;
  label: string;
  icon: string;
  authorizedCategories?: CmUserCategory[];
}

// list of the main menu links buttons
export const mainMenuLinks: MainMenuLink[] = [
  {
    label: 'dashboard',
    icon: 'dashboard',
    route: constDashboardFullRoute
  },
  {
    label: 'my_projects',
    icon: 'project',
    route: constProjectsFullRoute
  },
  {
    label: 'my_labs',
    icon: 'lab',
    route: constLabInstancesFullRoute
  },
  {
    label: 'labs_catalog',
    icon: 'view_list',
    route: constLabsConfig
  },
  {
    label: 'protocols',
    icon: 'protocol',
    route: constProtocolsRoute
  },
  {
    label: 'admin_dashboard',
    icon: 'admin_panel_settings',
    route: constAdminRoute,
    authorizedCategories: [CmUserCategory.ADMIN]
  },
  {
    label: 'settings',
    icon: 'settings',
    route: constSettingsFullRoute
  }
];
