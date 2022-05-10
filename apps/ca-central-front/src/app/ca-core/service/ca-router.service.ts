import {
  caConstAdminFullRoute,
  caConstBaseRoute,
  caConstDashboardFullRoute,
  caConstLabInstancesFullRoute,
  caConstProjectsFullRoute,
  caConstSettingsFullRoute,
  caConstSmartDbFullRoute,
  caConstStructureFullRoute
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

  public static getDashboardRoute(): string {
    return `${caConstDashboardFullRoute}`;
  }

  public static getLabInstanceDetailRoute(labInstanceId: string): string {
    return `${caConstLabInstancesFullRoute}/${labInstanceId}`;
  }

  public static getProjectDetailRoute(projectId: string): string {
    return `${caConstDashboardFullRoute}/project/${projectId}`;
  }

  public static getMyProjectsRoute(): string {
    return `${caConstProjectsFullRoute}`;
  }

  public static getExperimentDetailRoute(projectId: string, experimentId: string): string {
    return `${CaRouterService.getProjectDetailRoute(projectId)}/experiment/${experimentId}`;
  }

  public static getReportDetailRoute(projectId: string, reportId: string): string {
    return `${CaRouterService.getProjectDetailRoute(projectId)}/report/${reportId}`;
  }

  public static getMyLabInstancesRoute(): string {
    return `${caConstLabInstancesFullRoute}`;
  }

  public static getMySmartDbsRoute(): string {
    return `${caConstSmartDbFullRoute}`;
  }



  public static getSmartDbDetailRoute(id: string): string {
    return `${caConstSmartDbFullRoute}/${id}`;
  }

  public static getSmartDbDocDetailRoute(smartDbId: string, id: string): string {
    return `${caConstSmartDbFullRoute}/${smartDbId}/doc/${id}`;
  }

  public static getSmartDbAdminRoute(smartDbId: string): string {
    return `${caConstSmartDbFullRoute}/${smartDbId}/admin`;
  }



  ////////////////////////// STRUCTURE MODULE ///////////////////////
  public static getOrganizationRoute(organizationId: string): string {
    return `${caConstStructureFullRoute}/organization/${organizationId}`;
  }

  public static getTeamRoute(groupId: string): string {
    return `${caConstStructureFullRoute}/team/${groupId}`;
  }

  public static getMyTeamsRoute(): string {
    return `${caConstStructureFullRoute}/my-teams`;
  }

  public navigateToMyTeams(): void {
    this.router.navigate([CaRouterService.getMyTeamsRoute()]);
  }

  public navigateToTeam(groupId: string): void {
    this.router.navigate([CaRouterService.getTeamRoute(groupId)]);
  }

  ////////////////////////// ADMIN ///////////////////////

  public static getAdminRoute(): string {
    return `${caConstAdminFullRoute}`;
  }

  public navigateToAdmin(): void {
    this.router.navigate([CaRouterService.getAdminRoute()]);
  }


  ////////////////////////// SETTINGS ///////////////////////
  public static getSettingsRoute(): string {
    return `${caConstSettingsFullRoute}`;
  }

}
