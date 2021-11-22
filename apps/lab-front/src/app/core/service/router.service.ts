import {Injectable} from '@angular/core';
import {constBaseRoute, constBioxFullRoute, constMonitoringFullRoute} from '../utils/base-route';
import {Router} from '@angular/router';

/**
 * Class to get app route paths
 */
@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor(private router: Router) {
  }

  ////// Static function to get routes  //////
  public static getAppRoute(): string {
    return `/${constBaseRoute}`;
  }

  public static getBioxExperimentDetailRoute(bioxExperimentId: string): string {
    return `${constBioxFullRoute}/experiment/${bioxExperimentId}`;
  }

  public static getBioxResourceDetailRoute(id: string): string {
    return `${constBioxFullRoute}/resource/${id}`;
  }

  public static getLabMonitoringRoute(): string {
    return `${constMonitoringFullRoute}`;
  }

  /////////////////// NAVIGATE METHODS ///////////////////
  public navigateToBioxExperimentDetail(bioxExperimentId: string): Promise<boolean>{
    return this.router.navigate([RouterService.getBioxExperimentDetailRoute(bioxExperimentId)]);
  }
}
