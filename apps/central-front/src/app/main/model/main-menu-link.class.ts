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
import {UserCategory} from '../../core/model/entities/user.class';

export interface MainMenuLink {
  route: string;
  label: string;
  icon: string;
  authorizedCategories?: UserCategory[];
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
    authorizedCategories: [UserCategory.ADMIN]
  },
  {
    label: 'settings',
    icon: 'settings',
    route: constSettingsFullRoute
  }
];
