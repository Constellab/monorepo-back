import {
  caConstBaseRoute,
  caConstDashboardFullRoute,
  caConstLabInstancesFullRoute,
  caConstProjectsFullRoute,
  caConstSmartDbFullRoute
} from '../utils/ca-base-route';
import {Injectable} from '@angular/core';

/**
 * Class to get app route paths
 */
@Injectable({providedIn: 'root'})
export class CaRouterService {

  constructor() {
  }

  ////// Static function to get routes  //////
  public static getAppRoute(): string {
    return `/${caConstBaseRoute}`;
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

  ////// Function to navigate to routes  //////

}
