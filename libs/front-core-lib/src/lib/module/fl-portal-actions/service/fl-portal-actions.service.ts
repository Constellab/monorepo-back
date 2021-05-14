import {Injectable} from '@angular/core';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlPortalAction, FlPortalActionResult} from '../model/fl-portal-actions.class';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {FlPortalActionsComponent} from '../component/fl-portal-actions/fl-portal-actions.component';
import {FlPortalActionsState} from './fl-portal-actions.state';
import {Observable} from 'rxjs';

/**
 * Singleton to manager the portal loaders
 */
@Injectable()
export class FlPortalActionsService {


  // true if the portal loader is currently opened
  private isOpened: boolean = false;

  constructor(private portalService: FlPortalService,
              private loaderState: FlPortalActionsState) {
  }

  /**
   * A a loader or multiple loader to the loader portal
   * If portal is closed, it opens it
   * @param loaders
   */
  public addAction(loaders: FlPortalAction | FlPortalAction[]): void {
    if (this.isOpened) {
      this.loaderState.appendLoaders(loaders);
    } else {
      this.openPortal(loaders);
    }
  }


  private openPortal(loaders: FlPortalAction | FlPortalAction[]): void {
    // clear the loader list
    this.loaderState.setLoaders(loaders);

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
    return this.loaderState.getResult$(type);
  }
}
