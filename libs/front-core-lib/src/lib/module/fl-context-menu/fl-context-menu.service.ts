import {Injectable} from '@angular/core';
import {FlPortalService} from '../fl-portal/service/fl-portal.service';
import {FlContextMenuConfig} from './fl-context-menu.class';
import {FlPortalConnectedPosition} from '../fl-portal/model/fl-portal.class';
import {FlOverlayRef} from '../fl-portal/model/fl-overlay-ref.class';
import {FlContextMenuComponent} from './component/fl-context-menu/fl-context-menu.component';

@Injectable({
  providedIn: 'root'
})
export class FlContextMenuService {

  constructor(private portalService: FlPortalService) {
  }

  public openContextMenu(config: FlContextMenuConfig, element: Element): FlOverlayRef {
    // position on bottom right
    const positions: FlPortalConnectedPosition[] = [
      {originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
      'right', 'top', 'left', 'bottom'];

    const portalConfig = this.portalService.configureRelativePortal(element, positions, {
      panelClass: 'g-portal-background',
      elevation: true,
      disposeOnNavigation: true,
      disposeOnOutsideClick: true,
    });

    return this.portalService.createPortal(FlContextMenuComponent, portalConfig, config);
  }
}
