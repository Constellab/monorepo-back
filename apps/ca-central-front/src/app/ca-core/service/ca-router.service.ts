import {
  caConstAdminRoute,
  caConstBaseRoute,
  caConstDashboardRoute,
  caConstLabInstancesRoute,
  caConstMyProjectsRoute,
  caConstProjectRoute,
  caConstSettingsRoute,
  caConstSmartDbRoute,
  caConstStructureRoute
} from '../utils/ca-base-route';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

/* eslint-disable @typescript-eslint/member-ordering */
/**
 * Class to get app route paths
 */
@Injectable({providedIn: 'root'})
export class CaRouterService {

  constructor(private router: Router) {
  }

  ////// Static function to get routes  //////
  public static getAppRoute(): string {
    return `/${caConstBaseRoute}`;
  }

  public static getLoginRoute(): string {
    return `/login`;
  }

  public navigatorToLoginRoute(): void {
    this.router.navigate([CaRouterService.getLoginRoute()]);
  }

  public static getDashboardRoute(): string {
    return CaRouterService.getFullRoute(caConstDashboardRoute);
  }

  public static getLabInstanceDetailRoute(labInstanceId: string): string {
    return CaRouterService.getFullRoute(`${caConstLabInstancesRoute}/${labInstanceId}`);
  }

  public static getProjectDetailRoute(projectId: string): string {
    return CaRouterService.getFullRoute(`${caConstProjectRoute}/${projectId}`);
  }

  public static getMyProjectsRoute(): string {
    return CaRouterService.getFullRoute(caConstMyProjectsRoute);
  }

  public static getExperimentDetailRoute(experimentId: string): string {
    return CaRouterService.getFullRoute(`${caConstProjectRoute}/experiment/${experimentId}`);
  }

  public static getReportDetailRoute(reportId: string): string {
    return CaRouterService.getFullRoute(`${caConstProjectRoute}/report/${reportId}`);
  }

  public static getMyLabInstancesRoute(): string {
    return CaRouterService.getFullRoute(caConstLabInstancesRoute);
  }

  public static getMySmartDbsRoute(): string {
    return CaRouterService.getFullRoute(caConstSmartDbRoute);
  }

  public static getSmartDbDetailRoute(id: string): string {
    return `${CaRouterService.getMySmartDbsRoute()}/${id}`;
  }

  public static getSmartDbDocDetailRoute(smartDbId: string, id: string): string {
    return `${CaRouterService.getSmartDbDetailRoute(smartDbId)}/doc/${id}`;
  }

  public static getSmartDbAdminRoute(smartDbId: string): string {
    return `${CaRouterService.getSmartDbDetailRoute(smartDbId)}/admin`;
  }


  ////////////////////////// STRUCTURE MODULE ///////////////////////
  public static getOrganizationRoute(organizationId: string): string {
    return CaRouterService.getFullRoute(`${caConstStructureRoute}/organization/${organizationId}`);
  }

  public static getTeamRoute(groupId: string): string {
    return CaRouterService.getFullRoute(`${caConstStructureRoute}/team/${groupId}`);
  }

  public static getMyTeamsRoute(): string {
    return CaRouterService.getFullRoute(`${caConstStructureRoute}/my-teams`);
  }

  public navigateToMyTeams(): void {
    this.router.navigate([CaRouterService.getMyTeamsRoute()]);
  }

  public navigateToTeam(groupId: string): void {
    this.router.navigate([CaRouterService.getTeamRoute(groupId)]);
  }

  ////////////////////////// ADMIN ///////////////////////

  public static getAdminRoute(): string {
    return CaRouterService.getFullRoute(caConstAdminRoute);
  }

  public navigateToAdmin(): void {
    this.router.navigate([CaRouterService.getAdminRoute()]);
  }


  ////////////////////////// SETTINGS ///////////////////////
  public static getSettingsRoute(): string {
    return CaRouterService.getFullRoute(caConstSettingsRoute);
  }

  private static getFullRoute(route: string): string {
    return `/${caConstBaseRoute}/${route}`;
  }

}
