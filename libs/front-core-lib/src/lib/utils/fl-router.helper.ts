import {ActivatedRoute, NavigationEnd, Params, Router} from '@angular/router';
import {distinctUntilChanged, Observable, startWith} from 'rxjs';
import {filter, map} from 'rxjs/operators';


export class FlRouterHelper {

  /**
   * Method used to listen to params of children routes. The paramsInheritanceStrategy: 'always' option must
   * be set in the main RouterModule config (RouterModule.forRoot)
   * @param router
   * @param route
   */
  public static listenToChildrenParams(router: Router, route: ActivatedRoute): Observable<Params> {
    return router.events.pipe(
      // have a first emission
      startWith(new NavigationEnd(0, '', '')),
      filter(event => event instanceof NavigationEnd),
      // prevent triggering when the query params changed
      distinctUntilChanged(
        (previous: NavigationEnd, current: NavigationEnd) => previous.url.split('?')[0] === current.url.split('?')[0]
      ),
      // retrieve the child route
      map(() => {
        let currentRoute = route.snapshot;
        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
        }
        return currentRoute.params;
      }),
    );
  }
}
