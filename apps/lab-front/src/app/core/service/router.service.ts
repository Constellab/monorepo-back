import {Injectable} from '@angular/core';
import {constBaseRoute, constBioxFullRoute} from '../utils/base-route';

/**
 * Class to get app route paths
 */
@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor() {
  }

  ////// Static function to get routes  //////
  public static getAppRoute(): string {
    return `/${constBaseRoute}`;
  }

  // public
  public static getBioxExperimentDetailRoute(bioxExperimentId: string): string {
    return `${constBioxFullRoute}/experiment/${bioxExperimentId}`;
  }
}
