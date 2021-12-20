import {Injectable} from '@angular/core';
import {labConstBaseRoute, labConstBioxFullRoute, labConstMonitoringFullRoute} from '../utils/lab-base-route';
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

  public static getExperimentDetailRoute(bioxExperimentId: string): string {
    return `${labConstBioxFullRoute}/experiment/${bioxExperimentId}`;
  }

  public static getResourceDetailRoute(id: string): string {
    return `${labConstBioxFullRoute}/resource/${id}`;
  }

  public static getMonitoringRoute(): string {
    return `${labConstMonitoringFullRoute}`;
  }

  /////////////////// NAVIGATE METHODS ///////////////////
  public navigateToExperimentDetail(bioxExperimentId: string): Promise<boolean>{
    return this.router.navigate([LabRouterService.getExperimentDetailRoute(bioxExperimentId)]);
  }

  public navigateToResourceDetail(id: string): Promise<boolean>{
    return this.router.navigate([LabRouterService.getResourceDetailRoute(id)]);
  }
}
