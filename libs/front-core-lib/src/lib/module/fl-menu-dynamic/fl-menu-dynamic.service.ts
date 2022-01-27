import {ElementRef, Injectable} from '@angular/core';
import {FlPortalService} from '../fl-portal/service/fl-portal.service';
import {FlOverlayConfig, FlPortalConnectedPosition} from '../fl-portal/model/fl-portal.class';
import {FlMenuDynamic} from './model/fl-menu-dynamic.class';
import {FlOverlayRef} from '../fl-portal/model/fl-overlay-ref.class';
import {FlPortalConfig} from '../fl-portal/model/fl-portal-config.class';
import {FlMenuDynamicPortalComponent} from './component/fl-menu-dynamic-portal/fl-menu-dynamic-portal.component';

@Injectable({
  providedIn: 'root'
})
export class FlMenuDynamicService {

  private readonly overlayConfig: FlOverlayConfig = {
    disposeOnNavigation: true
  };


  private readonly positions: FlPortalConnectedPosition[] = [
    {originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
    'right', 'top', 'left', 'bottom'];

  constructor(private portalService: FlPortalService) {
  }

  /**
   * Open the menu portal relative to the element
   */
  public openDynamicMenuRelative(menu: FlMenuDynamic[],
                                 element: Element | ElementRef,
                                 position: FlPortalConnectedPosition[] = this.positions): FlOverlayRef {
    const config: FlPortalConfig = this.portalService.configureRelativePortal(element, position, this.overlayConfig);

    return this.createPortal(menu, config);
  }

  /**
   * Open the menu portal relative to the element on mouse position
   */
  public openDynamicMenuFromMouseEvent(menu: FlMenuDynamic[],
                                       mouseEvent: MouseEvent,
                                       position: FlPortalConnectedPosition[] = this.positions): FlOverlayRef {
    const config: FlPortalConfig = this.portalService.configureRelativePortalFromMouseEvent(mouseEvent,
      position, this.overlayConfig);

    return this.createPortal(menu, config);
  }

  /**
   * Open the menu on absolute position. BE CAREFUL, it can appear outside the screen. To use when openDynamicMenuFromMouseEvent
   * does not work correct
   */
  public openDynamicMenuAbsolute(menu: FlMenuDynamic[],
                                 event: MouseEvent): FlOverlayRef {
    const config: FlPortalConfig = this.portalService.configureAbsolutePortalFromMouseEvent(event);

    return this.createPortal(menu, config);
  }


  private createPortal(menu: FlMenuDynamic[], config: FlPortalConfig): FlOverlayRef {
    return this.portalService.createPortal(FlMenuDynamicPortalComponent, config, menu);
  }
}
