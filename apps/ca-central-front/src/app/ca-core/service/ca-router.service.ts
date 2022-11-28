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
import {environment} from '../../../environments/ca-environment';

/* eslint-disable @typescript-eslint/member-ordering */
/**
 * Class to get app route paths
 */
@Injectable({providedIn: 'root'})
export class CaRouterService {

  constructor(private router: Router) {
  }


  //////////////////////////////////// ROUTES OUTSIDE /APP ///////////////////////////////////////

  public static getLoginRoute(): string {
    return `/login`;
  }

  public navigatorToLoginRoute(): void {
    this.router.navigate([CaRouterService.getLoginRoute()]);
  }

  public static getNoSpaceRoute(): string {
    return `/no-space`;
  }

  //////////////////////////////////// ROUTES IN /APP ///////////////////////////////////////
  public static getAppRoute(): string {
    return `/${caConstBaseRoute}`;
  }

  public static getDashboardRoute(): string {
    return CaRouterService.getFullRoute(caConstDashboardRoute);
  }

  public navigateToDashboard(): void {
    this.router.navigate([CaRouterService.getDashboardRoute()]);
  }

  public static getLabInstanceDetailRoute(labInstanceId: string): string {
    return CaRouterService.getFullRoute(`${caConstLabInstancesRoute}/${labInstanceId}`);
  }

  //////////////////////////// PROJECT //////////////////////////////


  public static getProjectDetailRoute(projectId: string): string {
    return CaRouterService.getFullRoute(`${caConstProjectRoute}/${projectId}`);
  }

  public navigateToProjectDetail(projectId: string): void {
    this.router.navigate([CaRouterService.getProjectDetailRoute(projectId)]);
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


  ////////////////////////// SMART DB ///////////////////////

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

  public navigateToSmartDbDetail(id: string): void {
    this.router.navigate([CaRouterService.getSmartDbDetailRoute(id)]);
  }

  public navigateToMySmartDbs(): void {
    this.router.navigate([CaRouterService.getMySmartDbsRoute()]);
  }


  ////////////////////////// STRUCTURE MODULE ///////////////////////
  public static getCurrentSpaceRoute(): string {
    return CaRouterService.getFullRoute(`${caConstStructureRoute}/current-space`);
  }


  public static getTeamRoute(teamId: string): string {
    return CaRouterService.getFullRoute(`${caConstStructureRoute}/team/${teamId}`);
  }

  public static getMyTeamsRoute(): string {
    return CaRouterService.getFullRoute(`${caConstStructureRoute}/my-teams`);
  }

  public static getJoinSpaceRoute(code: string): string {
    return CaRouterService.getFullRoute(`${caConstStructureRoute}/join-space/${code}`);
  }


  public navigateToMyTeams(): void {
    this.router.navigate([CaRouterService.getMyTeamsRoute()]);
  }

  public navigateToTeam(teamId: string): void {
    this.router.navigate([CaRouterService.getTeamRoute(teamId)]);
  }

  public navigateToJoinSpace(code: string): void {
    this.router.navigate([CaRouterService.getJoinSpaceRoute(code)]);
  }

  ////////////////////////// ADMIN ///////////////////////

  public static getAdminRoute(): string {
    return CaRouterService.getFullRoute(caConstAdminRoute);
  }

  public static getAdminServersRoute(): string {
    return `${CaRouterService.getAdminRoute()}/servers`;
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

  ////////////////////////// OTHER SPACE URLS ///////////////////////


  public static getSpaceDomainBaseUrl(spaceDomain: string): string {
    if (environment.production) {
      return `https://${spaceDomain}.${environment.frontDomain}`;
    } else {
      return `http://${environment.frontDomain}:4200`;
    }
  }

  public static getSpaceDomainUrl(spaceDomain: string, fullRoute: string): string {
    return `${CaRouterService.getSpaceDomainBaseUrl(spaceDomain)}${fullRoute}`;
  }
}
