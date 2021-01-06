import {
  constBaseRoute,
  constDashboardFullRoute,
  constLabInstancesFullRoute,
  constLabsConfigFullRoute,
  constProjectsFullRoute,
  constProtocolsFullRoute
} from '../utils/base-route';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

/**
 * Option when navigating to LabIframe page to add query params
 */
export interface LabIframeOptions {
  objectType: 'experiment';
  objectId: string;
}

/**
 * Class to get app route paths
 */
@Injectable({providedIn: 'root'})
export class RouterService {

  constructor(private router: Router) {
  }

  ////// Static function to get routes  //////
  public static getAppRoute(): string {
    return `/${constBaseRoute}`;
  }

  public static getLabInstanceDetailRoute(labInstanceId: string): string {
    return `${constLabInstancesFullRoute}/${labInstanceId}`;
  }

  public static getLabIframeRoute(labInstanceId: string): string {
    return `${RouterService.getLabInstanceDetailRoute(labInstanceId)}/view`;
  }

  public static getProtocolDetailRoute(protocolId: string): string {
    return `${constProtocolsFullRoute}/${protocolId}`;
  }

  public static getProjectDetailRoute(projectId: string): string {
    return `${constDashboardFullRoute}/project/${projectId}`;
  }

  public static getMyProjectsRoute(): string {
    return `${constProjectsFullRoute}`;
  }

  public static getMyLabInstancesRoute(): string {
    return `${constLabInstancesFullRoute}`;
  }

  public static getMyLabsRoute(): string {
    return `${constLabsConfigFullRoute}`;
  }

  public static getMyProtocolsRoute(): string {
    return `${constProtocolsFullRoute}`;
  }


  ////// Function to navigate to routes  //////

  /**
   * @param labInstanceId lab id
   * @param options option to redirect the iframe to object id
   */
  public navigateToLabIframe(labInstanceId: string, options?: LabIframeOptions): void {
    const route = RouterService.getLabIframeRoute(labInstanceId);
    this.router.navigate([route], {queryParams: options});
  }
}
