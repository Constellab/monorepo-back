import {Injectable, OnDestroy} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';
import {FlBioNetworkDrawerAction, FlBioNetworkDrawerStateValue} from '../model/fl-bio-network-drawer-action.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {ClHelpService} from '@monorepo/core-lib';
import {filter, map} from 'rxjs/operators';


/**
 * State to manage the drawer and it's content in the pathway
 */
@Injectable()
export class FlBioNetworkDrawerState implements OnDestroy {

  private drawer: MatDrawer;
  private state$: BehaviorSubject<FlBioNetworkDrawerStateValue>;

  public init(drawer: MatDrawer): void {
    this.drawer = drawer;
    this.state$ = new BehaviorSubject<FlBioNetworkDrawerStateValue>({
      action: 'config', selectedNode: null
    });
    this.openDrawer();
  }


  public newAction(action: FlBioNetworkDrawerAction): void {
    this.openDrawer();

    const previousState: FlBioNetworkDrawerStateValue = ClHelpService.deepClone(this.state$.value);
    this.state$.next(Object.assign(previousState, action));
  }

  public getState$(): Observable<FlBioNetworkDrawerStateValue> {
    return this.state$.asObservable();
  }

  public openDrawer(): void {
    this.drawer.open();
  }

  public closeDrawer(): void {
    this.drawer.close();
  }

  public drawerClosed$(): Observable<void> {
    return this.drawer.openedChange.pipe(
      filter(open => !open),
      map(() => {
      })
    );
  }


  ngOnDestroy(): void {
    this.state$.complete();
    console.log('Destroy');
  }
}
