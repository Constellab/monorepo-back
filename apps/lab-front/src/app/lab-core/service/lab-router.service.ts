import {Injectable} from '@angular/core';
import {
  labConstBaseRoute,
  labConstBioxFullRoute,
  labConstDataboxFullRoute,
  labConstMonitoringFullRoute,
  labConstReportFullRoute
} from '../utils/lab-base-route';
import {Router} from '@angular/router';

/**
 * Class to get app route paths
 */
@Injectable({
  providedIn: 'root'
})
export class LabRouterService {

  constructor(private router: Router) {
  }

  ////// Static function to get routes  //////
  public static getAppRoute(): string {
    return `/${labConstBaseRoute}`;
  }

  public static getExperimentListRoute(): string {
    return `${labConstBioxFullRoute}`;
  }

  public static getDataboxRoute(): string {
    return `${labConstDataboxFullRoute}`;
  }

  public static getExperimentDetailRoute(id: string): string {
    return `${labConstBioxFullRoute}/experiment/${id}`;
  }

  public static getResourceDetailRoute(id: string): string {
    return `${labConstDataboxFullRoute}/resource/${id}`;
  }

  public static getMonitoringRoute(): string {
    return `${labConstMonitoringFullRoute}`;
  }

  public static getReportSearchRoute(): string {
    return `${labConstReportFullRoute}`;
  }

  public static getReportDetailRoute(id: string): string {
    return `${labConstReportFullRoute}/${id}`;
  }

  /////////////////// NAVIGATE METHODS ///////////////////
  public navigateToExperimentListRoute(): Promise<boolean> {
    return this.router.navigate([LabRouterService.getExperimentListRoute()]);
  }

  public navigateToDatabox(): Promise<boolean> {
    return this.router.navigate([LabRouterService.getDataboxRoute()]);
  }

  public navigateToExperimentDetail(id: string): Promise<boolean> {
    return this.router.navigate([LabRouterService.getExperimentDetailRoute(id)]);
  }

  public navigateToResourceDetail(id: string): Promise<boolean> {
    return this.router.navigate([LabRouterService.getResourceDetailRoute(id)]);
  }

  public navigateToReportDetail(id: string): Promise<boolean> {
    return this.router.navigate([LabRouterService.getReportDetailRoute(id)]);
  }

  public navigateToReportSearch(): Promise<boolean> {
    return this.router.navigate([LabRouterService.getReportSearchRoute()]);
  }
}
