import {ElementRef, Injectable} from '@angular/core';
import {FlPortalService} from '../fl-portal/service/fl-portal.service';
import {FlPortalConnectedPosition, PortalAbsolutePosition} from '../fl-portal/model/fl-portal.class';
import {FlMenuDynamic} from './model/fl-menu-dynamic.class';
import {FlOverlayRef} from '../fl-portal/model/fl-overlay-ref.class';
import {FlPortalConfig} from '../fl-portal/model/fl-portal-config.class';
import {FlMenuDynamicPortalComponent} from './component/fl-menu-dynamic-portal/fl-menu-dynamic-portal.component';

@Injectable({
  providedIn: 'root'
})
export class FlMenuDynamicService {

  constructor(private portalService: FlPortalService) {
  }

  public openDynamicMenuRelative(menu: FlMenuDynamic[],
                                 element: Element | ElementRef,
                                 position: FlPortalConnectedPosition[]): FlOverlayRef {
    const config: FlPortalConfig = this.portalService.configureRelativePortal(element, position);

    return this.createPortal(menu, config);
  }

  public openDynamicMenuFromMouseEvent(menu: FlMenuDynamic[],
                                       mouseEvent: MouseEvent): FlOverlayRef {
    const config: FlPortalConfig = this.portalService.configureAbsolutePortalFromMouseEvent(mouseEvent);

    return this.createPortal(menu, config);
  }

  public openDynamicMenuAbsolute(menu: FlMenuDynamic[],
                                 position: PortalAbsolutePosition): FlOverlayRef {
    const config: FlPortalConfig = this.portalService.configureAbsolutePortal(position);

    return this.createPortal(menu, config);
  }

  private createPortal(menu: FlMenuDynamic[], config: FlPortalConfig): FlOverlayRef {
    config.config.hasBackdrop = false;
    return this.portalService.createPortal(FlMenuDynamicPortalComponent, config, menu);
  }
}
