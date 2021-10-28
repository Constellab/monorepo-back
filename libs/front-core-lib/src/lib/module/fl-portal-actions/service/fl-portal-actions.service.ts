import {Injectable} from '@angular/core';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlPortalAction, FlPortalActionResult} from '../model/fl-portal-actions.class';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {FlPortalActionsComponent} from '../component/fl-portal-actions/fl-portal-actions.component';
import {FlPortalActionsState} from './fl-portal-actions.state';
import {Observable} from 'rxjs';
import {FlOverlayRef} from '../../fl-portal/model/fl-overlay-ref.class';

/**
 * Singleton to manager the portal actions
 */
@Injectable()
export class FlPortalActionsService {


  //provided if a portal is currently opened
  private currentOverlay: FlOverlayRef = null;

  private autoClose: boolean = false;
  private autoCloseDelay: number = 3000;
  private autoCloseTimer: number = null;


  constructor(private portalService: FlPortalService,
              private actionsState: FlPortalActionsState) {
    actionsState.getResult$().subscribe(
      () => this.onResult()
    );
  }

  /**
   * A an action or multiple actions to the action portal
   * If portal is closed, it opens it
   * @param actions
   * @param autoClose if true, the portal is close after all the action finished (with a small delay)
   * @param openPortal when false the portal is not opened if it doesn't exists
   */
  public addAction(actions: FlPortalAction | FlPortalAction[], autoClose?: boolean,
                   openPortal: boolean = true): void {
    // clear the auto close timer if it exists
    this.clearAutoCloseTimer();

    // update the auto close value
    if (autoClose != null) {
      this.autoClose = autoClose;
    }

    if (this.currentOverlay != null) {
      this.actionsState.appendActions(actions);
    } else if (!openPortal) {
      // if we don't open the portal, only set actions
      this.actionsState.setActions(actions);
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
    this.currentOverlay = this.portalService.createPortal(FlPortalActionsComponent, portalConfig);

    this.currentOverlay.detachments().subscribe(
      () => this.onPortalClosed()
    );
  }

  private onPortalClosed(): void {
    this.currentOverlay = null;
  }

  private closeOverlay(): void {
    this.currentOverlay?.dispose();
  }

  /**
   * Subscribe to the result
   * @param type, if provided, only emit result for actions of type
   */
  public getResult$(type?: string): Observable<FlPortalActionResult> {
    return this.actionsState.getResult$(type);
  }

  // each time a result is emitted, check if auto close is set and if all action are finished
  private onResult(): void {
    if (this.autoClose && this.actionsState.allActionFinished()) {
      // call close with a delay
      this.autoCloseTimer = setTimeout(() => this.checkAndAutoClose(), this.autoCloseDelay);
    }
  }

  // called after a delay, check if all actions are still finished and close if yes
  private checkAndAutoClose(): void {
    if (this.actionsState.allActionFinished()) {
      this.closeOverlay();
    }
  }

  private clearAutoCloseTimer(): void {
    if (this.autoCloseTimer != null) {
      clearTimeout(this.autoCloseTimer);
    }
  }
}
