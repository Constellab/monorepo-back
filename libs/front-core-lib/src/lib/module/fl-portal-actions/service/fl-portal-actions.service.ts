import {Injectable} from '@angular/core';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlPortalAction, FlPortalActionResult} from '../model/fl-portal-actions.class';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {FlPortalActionsComponent} from '../component/fl-portal-actions/fl-portal-actions.component';
import {FlPortalActionsState} from './fl-portal-actions.state';
import {Observable} from 'rxjs';

/**
 * Singleton to manager the portal actions
 */
@Injectable()
export class FlPortalActionsService {


  // true if the portal actions is currently opened
  private isOpened: boolean = false;

  constructor(private portalService: FlPortalService,
              private actionsState: FlPortalActionsState) {
  }

  /**
   * A an action or multiple actions to the action portal
   * If portal is closed, it opens it
   * @param actions
   */
  public addAction(actions: FlPortalAction | FlPortalAction[]): void {
    if (this.isOpened) {
      this.actionsState.appendActions(actions);
    } else {
      this.openPortal(actions);
    }
  }


  private openPortal(actions: FlPortalAction | FlPortalAction[]): void {
    // clear the action list
    this.actionsState.setActions(actions);

    // set portal on bottom right
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {right: '10px', bottom: '10px'},
      {
        elevation: true,
        panelClass: 'g-portal-panel'
      });

    // open portal
    this.portalService.createPortal(FlPortalActionsComponent, portalConfig).detachments().subscribe(
      () => this.onPortalClosed()
    );

    // mark as open
    this.isOpened = true;
  }

  private onPortalClosed(): void {
    this.isOpened = false;
  }

  /**
   * Subscribe to the result
   * @param type, if provided, only emit result for actions of type
   */
  public getResult$(type?: string): Observable<FlPortalActionResult> {
    return this.actionsState.getResult$(type);
  }
}
