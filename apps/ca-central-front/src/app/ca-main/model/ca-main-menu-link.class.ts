import {CmUserCategory} from '@monorepo/common-model';
import {CaRouterService} from '../../ca-core/service/ca-router.service';

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
    route: CaRouterService.getDashboardRoute(),
  },
  {
    label: 'my_projects',
    icon: 'project',
    route: CaRouterService.getMyProjectsRoute()
  },
  {
    label: 'my_labs',
    icon: 'lab',
    route: CaRouterService.getMyLabInstancesRoute()
  },
  {
    label: 'my_teams',
    icon: 'group',
    route: CaRouterService.getMyTeamsRoute()
  },
  {
    label: 'my_smart_db',
    icon: 'smart_db',
    route: CaRouterService.getMySmartDbsRoute(),
  },
  {
    label: 'admin_dashboard',
    icon: 'admin_panel_settings',
    route: CaRouterService.getAdminRoute(),
    authorizedCategories: [CmUserCategory.ADMIN]
  },
  // {
  //   label: 'settings',
  //   icon: 'settings',
  //   route: CaRouterService.getSettingsRoute()
  // }
];
