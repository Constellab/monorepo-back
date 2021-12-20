import {
  caConstBaseRoute,
  caConstDashboardFullRoute,
  caConstLabInstancesFullRoute,
  caConstLabsConfigFullRoute,
  caConstProjectsFullRoute
} from '../utils/ca-base-route';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

/**
 * Option when navigating to LabIframe page to add query params
 */
export interface CaLabIframeOptions {
  objectType: 'experiment';
  objectId: string;
}

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

  public static getLabInstanceDetailRoute(labInstanceId: string): string {
    return `${caConstLabInstancesFullRoute}/${labInstanceId}`;
  }

  public static getLabIframeRoute(labInstanceId: string): string {
    return `${CaRouterService.getLabInstanceDetailRoute(labInstanceId)}/view`;
  }


  public static getProjectDetailRoute(projectId: string): string {
    return `${caConstDashboardFullRoute}/project/${projectId}`;
  }

  public static getMyProjectsRoute(): string {
    return `${caConstProjectsFullRoute}`;
  }

  public static getMyLabInstancesRoute(): string {
    return `${caConstLabInstancesFullRoute}`;
  }

  public static getMyLabsRoute(): string {
    return `${caConstLabsConfigFullRoute}`;
  }

  ////// Function to navigate to routes  //////

  /**
   * @param labInstanceId lab id
   * @param options option to redirect the iframe to object id
   */
  public navigateToLabIframe(labInstanceId: string, options?: CaLabIframeOptions): void {
    const route = CaRouterService.getLabIframeRoute(labInstanceId);
    this.router.navigate([route], {queryParams: options});
  }
}
