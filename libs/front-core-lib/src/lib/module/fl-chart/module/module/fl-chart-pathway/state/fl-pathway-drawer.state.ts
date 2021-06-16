import {Injectable, OnDestroy} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';
import {FlPathwayDrawerAction} from '../model/fl-pathway-drawer-action.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

/**
 * Event trigger when the open property of the drawer changed
 * It also return the action of the drawer
 */
export interface FLPathwayDrawerChanged {
  open: boolean;
  action: FlPathwayDrawerAction;
}

/**
 * State to manage the drawer and it's content in the pathway
 */
@Injectable()
export class FlPathwayDrawerState implements OnDestroy {

  private drawer: MatDrawer;
  private action$: BehaviorSubject<FlPathwayDrawerAction>;

  public init(drawer: MatDrawer): void {
    this.drawer = drawer;
    this.action$ = new BehaviorSubject<FlPathwayDrawerAction>(null);
  }

  public newAction(action: FlPathwayDrawerAction): void {
    this.drawer.open();
    this.action$.next(action);
  }

  public getAction$(): Observable<FlPathwayDrawerAction> {
    return this.action$.asObservable().pipe(filter(action => action != null));
  }

  public openChange$(): Observable<FLPathwayDrawerChanged> {
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
