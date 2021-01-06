import {Component, Inject, NgZone, OnDestroy, OnInit} from '@angular/core';
import {
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  Overlay
} from '@angular/cdk/overlay';
import {Subscription} from 'rxjs';
import {PORTAL_DATA, portalArrowOffset} from '../../../../model/global/portal/portal.class';
import {CoreOverlayRef} from '../../../../model/global/portal/core-overlay-ref.class';
import {PortalConfig} from '../../../../model/global/portal/portal-config';
import {HelpService} from '../../../../utils/help-service';

/**
 * Small component to display an arrow on the portal with arrow
 */
@Component({
  selector: 'gen-portal-arrow',
  templateUrl: './portal-arrow.component.html',
  styleUrls: ['./portal-arrow.component.scss']
})
export class PortalArrowComponent implements OnInit, OnDestroy {

  mode: 'left' | 'right' | 'top' | 'bottom';

  // config of the main overlay
  mainConfig: PortalConfig;
  arrowColor: string;

  subscription: Subscription;
  hideArrow: boolean = false;

  constructor(@Inject(PORTAL_DATA) data: any,
              private overlayRef: CoreOverlayRef, private overlay: Overlay,
              private ngZone: NgZone) {

    // arrow white by default
    if (!data.arrowColor) {
      this.arrowColor = '#FFFFFF';
    } else {
      this.arrowColor = data.arrowColor;
    }

    this.mainConfig = data.mainConfig;
  }

  ngOnInit(): void {

    // listen to main overlay position change
    const position: FlexibleConnectedPositionStrategy =
      this.mainConfig.config.positionStrategy as FlexibleConnectedPositionStrategy;
    this.subscription = position.positionChanges.subscribe(
      change => this.onPositionChanges(change)
    );
  }

  // on main overlay position change
  private onPositionChanges(change: ConnectedOverlayPositionChange): void {
    const position: ConnectionPositionPair = HelpService.deepClone(change.connectionPair);

    // change the arrow orrientation
    this.changeArrowMode(position);

    // change the arrow position
    this.changeOverlayPosition(position);
  }

  // change the arrow position
  private changeOverlayPosition(position: ConnectedPosition): void {
    // compensate the offset
    switch (this.mode) {
      case 'top':
        position.offsetY -= portalArrowOffset;
        break;
      case 'bottom':
        position.offsetY += portalArrowOffset;
        break;
      case 'left':
        position.offsetX += portalArrowOffset;
        break;
      case 'right':
        position.offsetX -= portalArrowOffset;
        break;
    }


    // set the portal position relative to the element with a margin of 10 for the viewport
    const positionStrategy = this.overlay.position().flexibleConnectedTo(this.mainConfig.hostElement)
      .withPositions([position]).withViewportMargin(10);

    // update the arrow position based on the main overlay position
    this.overlayRef.overlayRef.updatePositionStrategy(positionStrategy);
  }

  // change the arrow orientation
  private changeArrowMode(position: ConnectedPosition): void {
    // to prevent both axes to be opposite
    const xIsOpposite: boolean = (position.overlayX === 'start' && position.originX === 'end') ||
      (position.overlayX === 'end' && position.originX === 'start');
    const yIsOpposite: boolean = (position.overlayY === 'top' && position.originY === 'bottom') ||
      (position.overlayY === 'bottom' && position.originY === 'top');


    // needed to force the refresh
    this.ngZone.run(() => {

      // handle the different overlay position
      // the portal is on the left of the host element
      if (position.overlayX === 'start' && position.originX === 'end' && !yIsOpposite) {
        this.mode = 'right';

        // the portal is on the right of the host element
      } else if (position.overlayX === 'end' && position.originX === 'start' && !yIsOpposite) {
        this.mode = 'left';

        // the portal is on the bottom of the host element
      } else if (position.overlayY === 'top' && position.originY === 'bottom' && !xIsOpposite) {
        this.mode = 'top';

        // the portal is on top of the host element
      } else if (position.overlayY === 'bottom' && position.originY === 'top' && !xIsOpposite) {
        this.mode = 'bottom';
      } else {
        // Positio no supported
        console.error('The overlay position does not support the arrow');
        this.hideArrow = true;
      }
    });
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
