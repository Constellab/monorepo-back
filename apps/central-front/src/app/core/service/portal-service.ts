import {ElementRef, Injectable, Injector} from '@angular/core';
import {
  BlockScrollStrategy,
  CloseScrollStrategy,
  ComponentType,
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayRef
} from '@angular/cdk/overlay';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {NavigationStart, Router} from '@angular/router';
import {filter, first, map} from 'rxjs/operators';
import {merge, Observable} from 'rxjs';
import {CloseScrollStrategyConfig} from '@angular/cdk/overlay/scroll/close-scroll-strategy';
import {CustomOverlayConfig, PORTAL_DATA, portalArrowOffset, PortalDefaultPosition} from '../model/global/portal/portal.class';
import {PortalConfig} from '../model/global/portal/portal-config';
import {CoreOverlayRef} from '../model/global/portal/core-overlay-ref.class';
import {PortalArrowComponent} from '../module/core-component/component/portal-arrow/portal-arrow.component';

/**
 * Service to simplify creation of portal relative to an element
 *
 * Portal are element that are created over the page (like tooltip, menu)
 *
 * See : https://material.angular.io/cdk/overlay/overview
 *
 * See :https://material.angular.io/cdk/portal/overview
 *
 */
@Injectable({providedIn: 'root'})
export class PortalService {

  constructor(private overlay: Overlay, private injector: Injector,
              private router: Router) {
  }

  /**
   * Configure the portal to be relative to an element
   * @param element host element for the position of the portal
   * @param position positions of the portal with the element. If multiple positions are provided, its uses
   * the next position if the previous one is off the screen. Or use default position
   * @param configuration configuration for the overlay
   */
  public configureRelativePortal(element: Element | ElementRef,
                                 position: ConnectedPosition[] | PortalDefaultPosition,
                                 configuration: CustomOverlayConfig = {}): PortalConfig {

    // save the element to the config
    const hostElement = this.convertToElementRef(element);
    const config: PortalConfig = new PortalConfig(hostElement, configuration);

    // convert position to ConnectedPosition[]
    const positions: ConnectedPosition[] = this.convertPositionToConnectedPosition(position);

    // set the position strategy
    config.setRelativePositionStrategy(this.getFlexiblePositionStrategy(element, positions));

    // if we show the arrow
    if (config.config.showArrow) {
      this.configureOffset(positions, config);
    }

    return config;
  }

  /**
   * Get a flexible position strategy relative to an element for a portal
   * @param element relative element for position
   * @param positions position of the portal compare to element
   */
  public getFlexiblePositionStrategy(element: Element | ElementRef, positions: ConnectedPosition[])
    : FlexibleConnectedPositionStrategy {
    const elementRef: ElementRef = this.convertToElementRef(element);

    // set the portal position relative to the element with a margin of 10 for the viewport
    return this.overlay.position().flexibleConnectedTo(elementRef)
      .withPositions(positions).withViewportMargin(20);
  }

  // configure the overlay offset if we need an arrow
  private configureOffset(positions: ConnectedPosition[], config: PortalConfig): void {
    for (const position of positions) {
      if (position.offsetY == null) {
        position.offsetY = 0;
      }
      if (position.offsetX == null) {
        position.offsetX = 0;
      }

      // set the offset of the portal for the arrow, depending on the position
      if (position.originY === 'top' && position.overlayY === 'bottom') {
        position.offsetY -= portalArrowOffset;
      } else if (position.originY === 'bottom' && position.overlayY === 'top') {
        position.offsetY += portalArrowOffset;
      } else if (position.originX === 'start' && position.overlayX === 'end') {
        position.offsetX -= portalArrowOffset;
      } else if (position.originX === 'end' && position.overlayX === 'start') {
        position.offsetX += portalArrowOffset;
      } else {
        console.error('The overlay position does not support the arrow');
        // cancel the arrow
        config.config.showArrow = false;
      }
    }
  }


  /**
   * Create the portal on the dom with the configuration
   * @param component the component attached to the portal
   * @param config the portal configuration
   * @param data data to send to the portal. Get the data in the component by inject -->
   * \@Inject(LIB_PORTAL_DATA) data: any
   */
  public createPortal<T>(component: ComponentType<T>, config: PortalConfig, data: any = {}): CoreOverlayRef {
    // we create the overlay
    const overlayRef: CoreOverlayRef = this.createOverlay(config.config);

    // manage the portal dispose
    if (config.config.disposeOnBackdropClick || config.config.disposeOnNavigation) {
      this.managePortalDisposing(config, overlayRef);
    }

    // create the injector
    const injector = this.createInjector(data, overlayRef);

    // create the component with the inject
    const componentPortal: ComponentPortal<T> =
      new ComponentPortal(component, null, injector);

    // attache the component to the dom
    overlayRef.attach(componentPortal);

    // created the arrow if needed before the main portal so that it is under it
    if (config.config.showArrow) {
      this.createArrowPortal(config, overlayRef);
    }

    return overlayRef;
  }

  private createOverlay(config: CustomOverlayConfig): CoreOverlayRef {
    // we create the overlay
    const ref: OverlayRef = this.overlay.create(config);

    // add we create the custom CoreOverlayRef
    return new CoreOverlayRef(ref);
  }

  private managePortalDisposing(config: PortalConfig, overlayRef: CoreOverlayRef): void {
    const obs$: Observable<boolean>[] = [];

    // unsubscribe when the portal is disposed (thank to the false)
    obs$.push(overlayRef.detachments().pipe(map(() => false)));

    // close the portal on navigation (the default doesn't work with routerLink)
    if (config.config.disposeOnNavigation) {

      // get the router events
      obs$.push(this.router.events.pipe(
        // only trigger on Navigation start
        filter(value => value instanceof NavigationStart),
        // set response to true to close the portal
        map(() => true))
      );
    }

    // manage the disposeOnBackdropClick
    if (config.config.disposeOnBackdropClick) {
      // on a backdrop click --> close the portal
      obs$.push(overlayRef.backdropClick().pipe(map(() => true)));
    }

    // merge events and unsubscribe on the first emission
    merge(...obs$).pipe(first()).subscribe((val) => {
      // if we received a true --> close the portal
      if (val) {
        overlayRef.dispose();
      }
    });
  }

  /**
   * Create the arrow portal pointed to the host element
   * @param mainConfig PortalConfig of the main portal
   * @param mainOverlayRef overlay of the main portal
   */
  private createArrowPortal(mainConfig: PortalConfig, mainOverlayRef: CoreOverlayRef): void {
    const arrowConfig: CustomOverlayConfig = {};

    // if the overlay has a size, add the specific class to hide the arrow on small screen
    if (mainConfig.config.size) {
      arrowConfig.panelClass = 'g-arrow-overlay';
    }

    // set a default position, the position is handle in the arrow component
    const defaultPosition: ConnectedPosition = {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top'
    };
    // configure the overlay relative to the same element as the host
    const arrowConfigurer: PortalConfig =
      this.configureRelativePortal(mainConfig.hostElement, [defaultPosition], arrowConfig);
    const arrowOverlay: CoreOverlayRef = this.createPortal(PortalArrowComponent, arrowConfigurer,
      {arrowColor: mainConfig.config.arrowColor, mainConfig: mainConfig});

    // close the arrow portal when the main portal is closed
    mainOverlayRef.detachments().subscribe(
      () => arrowOverlay.dispose()
    );
  }

  // create an injector to send data to the portal and the overlay ref
  private createInjector(data: any, overlayRef: CoreOverlayRef): PortalInjector {
    const injectionTokens = new WeakMap();
    // send data to the portal
    injectionTokens.set(PORTAL_DATA, data);
    // inject the overlay ref
    injectionTokens.set(CoreOverlayRef, overlayRef);

    return new PortalInjector(this.injector, injectionTokens);
  }

  /**
   * Get the strategy to close the portal on scroll
   * @param config strategy config
   */
  public getCloseOnScrollStrategy(config?: CloseScrollStrategyConfig | undefined): CloseScrollStrategy {
    return this.overlay.scrollStrategies.close(config);
  }

  /**
   * Get the strategy to block scrolling when the portal is open
   */
  public getBlockScrollStrategy(): BlockScrollStrategy {
    return this.overlay.scrollStrategies.block();
  }

  private convertToElementRef(element: Element | ElementRef): ElementRef {
    if (element instanceof ElementRef) {
      return element;
    } else {
      return new ElementRef(element);
    }
  }

  private convertPositionToConnectedPosition(position: ConnectedPosition[] | PortalDefaultPosition): ConnectedPosition[] {
    if (position instanceof Array) {
      return position;
    }

    // manage default position
    switch (position) {
      case 'right':
        return [{
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
        }];
      case 'left':
        return [{
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
        }];
      case 'top':
        return [{
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
        }];
      case 'bottom':
        return [{
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
        }];
    }
  }
}

