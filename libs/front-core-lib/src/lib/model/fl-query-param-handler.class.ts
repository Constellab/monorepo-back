import {ActivatedRoute, Params, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';

/**
 * Simple class to simplify QueryParam management
 */
export class FlQueryParamHandler<T extends Params = Params> {

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  /**
   * Get the query params only one time
   */
  public getFirstQueryParams(): Observable<T> {
    return this.getQueryParams().pipe(first());
  }

  /**
   * Subscribe to query params
   */
  public getQueryParams(): Observable<T> {
    return this.route.queryParams.pipe(first()) as Observable<T>;
  }

  /**
   * Merge the param to the current query params
   * @param params
   * @param replaceUrl When true, navigates while replacing the current state in history.
   */
  public mergeQueryParams(params: Partial<T>, replaceUrl: boolean = true): void {
    // save the criteria list in the url as query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      replaceUrl: replaceUrl,
      queryParamsHandling: 'merge'
    });
  }
}
