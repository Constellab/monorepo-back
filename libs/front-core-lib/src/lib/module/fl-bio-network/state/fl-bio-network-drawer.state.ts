import {Injectable, OnDestroy} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';
import {FlBioNetworkDrawerAction} from '../model/fl-bio-network-drawer-action.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

/**
 * Event trigger when the open property of the drawer changed
 * It also return the action of the drawer
 */
export interface FLBioNetworkDrawerChanged {
  open: boolean;
  action: FlBioNetworkDrawerAction;
}

/**
 * State to manage the drawer and it's content in the pathway
 */
@Injectable()
export class FlBioNetworkDrawerState implements OnDestroy {

  private drawer: MatDrawer;
  private action$: BehaviorSubject<FlBioNetworkDrawerAction>;

  public init(drawer: MatDrawer): void {
    this.drawer = drawer;
    this.action$ = new BehaviorSubject<FlBioNetworkDrawerAction>(null);
  }

  public newAction(action: FlBioNetworkDrawerAction): void {
    this.drawer.open();
    this.action$.next(action);
  }

  public getAction$(): Observable<FlBioNetworkDrawerAction> {
    return this.action$.asObservable().pipe(filter(action => action != null));
  }

  public openChange$(): Observable<FLBioNetworkDrawerChanged> {
    return this.drawer.openedChange.pipe(
      map(open => {
        return {
          open: open,
          action: this.action$.value
        };
      })
    );
  }

  ngOnDestroy(): void {
    this.action$.complete();
    console.log('Destroy');
  }
}
