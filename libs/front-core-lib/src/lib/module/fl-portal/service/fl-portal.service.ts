import {
  ElementRef,
  Injectable,
  Injector,
  Renderer2,
  RendererFactory2,
  StaticProvider,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {
  BlockScrollStrategy,
  CloseScrollStrategy,
  ComponentType,
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  GlobalPositionStrategy,
  Overlay,
  OverlayRef
} from '@angular/cdk/overlay';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {NavigationStart, Router} from '@angular/router';
import {filter, first, map} from 'rxjs/operators';
import {merge, Observable} from 'rxjs';
import {CloseScrollStrategyConfig} from '@angular/cdk/overlay/scroll/close-scroll-strategy';
import {FlPortalConfig, FlRelativePortalConfig} from '../model/fl-portal-config.class';
import {
  FL_PORTAL_DATA,
  FlOverlayConfig,
  flPortalArrowOffset,
  FlPortalConnectedPosition,
  FlPortalDefaultPosition,
  FlRelativeOverlayConfig,
  PortalAbsolutePosition
} from '../model/fl-portal.class';
import {FlOverlayRef} from '../model/fl-overlay-ref.class';
import {FlPortalArrowComponent} from '../component/fl-portal-arrow/fl-portal-arrow.component';
import {FlEventWrapper} from '../../../model/fl-event-wrapper.class';


/**
 * Service to simplify creation of portal relative to an element
 *
 * Portal are element that are created over the page (like tooltip, menu)
 *
 * See : https://material.angular.io/cdk/overlay/overview
 *
 * See : https://material.angular.io/cdk/portal/overview
 *
 */
@Injectable()
export class FlPortalService {

  private renderer: Renderer2;

  constructor(private overlay: Overlay, private injector: Injector,
              private router: Router, rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Configure the portal to be relative to an element
   * @param element host element for the position of the portal
   * @param positions positions of the portal with the element. If multiple positions are provided, its uses
   * the next position if the previous one is off the screen. Or use default position
   * @param configuration configuration for the overlay
   */
  public configureRelativePortal(element: Element | ElementRef,
                                 positions: FlPortalConnectedPosition[] | FlexibleConnectedPositionStrategy,
                                 configuration: FlRelativeOverlayConfig = {}): FlPortalConfig {

    // save the element to the config
    const hostElement = this.convertToElementRef(element);
    const config: FlRelativePortalConfig = new FlRelativePortalConfig(hostElement).configureOverlay(configuration);

    // create the connected strategy only if
    let strategy: FlexibleConnectedPositionStrategy;
    if (positions instanceof FlexibleConnectedPositionStrategy) {
      strategy = positions;
    } else {
      strategy = this.getFlexiblePositionStrategy(element, positions, configuration.viewPortMargin);
    }

    // set the position strategy
    config.setPositionStrategy(strategy);

    // if we show the arrow
    if (config.config.showArrow) {
      this.configureOffset(strategy.positions, config);
    }

    return config;
  }

  /**
   * Get a flexible position strategy relative to an element for a portal
   * @param element relative element for position
   * @param positions position of the portal compare to element
   * @param viewPortMargin margin on the border
   */
  public getFlexiblePositionStrategy(element: Element | ElementRef, positions: FlPortalConnectedPosition[],
                                     viewPortMargin: number = 20)
    : FlexibleConnectedPositionStrategy {
    const elementRef: ElementRef = this.convertToElementRef(element);

    const connectedPositions: ConnectedPosition[] = this.convertPositionToConnectedPosition(positions);

    // set the portal position relative to the element with a margin of 10 for the viewport
    return this.overlay.position().flexibleConnectedTo(elementRef)
      .withPositions(connectedPositions).withViewportMargin(viewPortMargin);
  }

  /**
   * Configure a portal at the mouse position, but uses element position if there is not enough space
   * @param mouseEvent
   * @param positions
   * @param configuration
   */
  public configureRelativePortalFromMouseEvent(mouseEvent: MouseEvent,
                                               positions: FlPortalConnectedPosition[],
                                               configuration: FlRelativeOverlayConfig = {}): FlPortalConfig {
    const element: Element = mouseEvent.target as any;

    const strategy = this.getFlexiblePositionStrategy(element, positions)
      // calculate the offset position to be on click event position, using a relative portal
      .withDefaultOffsetX(-(element.clientWidth - mouseEvent.offsetX))
      .withDefaultOffsetY(-(element.clientHeight - mouseEvent.offsetY));

    return this.configureRelativePortal(element, strategy, configuration);
  }

  /**
   * Configure an absolute portal form the position of a mouse event
   * This portal is not linked to a host element
   */
  public configureAbsolutePortalFromMouseEvent(mouseEvent: MouseEvent, configuration: FlOverlayConfig = {}): FlPortalConfig {
    return this.configureAbsolutePortal({top: mouseEvent.clientY + 'px', left: mouseEvent.clientX + 'px'}, configuration);
  }

  /**
   * Configure an absolute portal form top and left position
   * This portal is not linked to a host element
   */
  public configureAbsolutePortal(position: PortalAbsolutePosition, configuration: FlOverlayConfig = {}): FlPortalConfig {
    // save the element to the config
    const config: FlPortalConfig = new FlPortalConfig().configureOverlay(configuration);

    config.setPositionStrategy(this.getAbsolutePositionStrategy(position));

    return config;
  }

  public getAbsolutePositionStrategy(position: PortalAbsolutePosition): GlobalPositionStrategy {
    // set the portal position relative to the element with a margin of 10 for the viewport
    const globalPosition: GlobalPositionStrategy = this.overlay.position().global();

    // set position if params are set
    if (position.top != null) globalPosition.top(position.top);
    if (position.left != null) globalPosition.left(position.left);
    if (position.bottom != null) globalPosition.bottom(position.bottom);
    if (position.right != null) globalPosition.right(position.right);

    if (position.centerHorizontally != null) globalPosition.centerHorizontally(position.centerHorizontally);
    if (position.centerVertically != null) globalPosition.centerHorizontally(position.centerVertically);

    return globalPosition;
  }

  // configure the overlay offset if we need an arrow
  private configureOffset(positions: ConnectedPosition[], config: FlRelativePortalConfig): void {
    for (const position of positions) {
      if (position.offsetY == null) {
        position.offsetY = 0;
      }
      if (position.offsetX == null) {
        position.offsetX = 0;
      }

      // set the offset of the portal for the arrow, depending on the position
      if (position.originY === 'top' && position.overlayY === 'bottom') {
        position.offsetY -= flPortalArrowOffset;
      } else if (position.originY === 'bottom' && position.overlayY === 'top') {
        position.offsetY += flPortalArrowOffset;
      } else if (position.originX === 'start' && position.overlayX === 'end') {
        position.offsetX -= flPortalArrowOffset;
      } else if (position.originX === 'end' && position.overlayX === 'start') {
        position.offsetX += flPortalArrowOffset;
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
  public createPortal<T>(component: ComponentType<T>, config: FlPortalConfig, data: any = {}): FlOverlayRef {
    // we create the overlay
    const overlayRef: FlOverlayRef = this.createOverlay(config.config);

    // manage the portal dispose
    if (config.config.disposeOnBackdropClick || config.config.disposeOnNavigation || config.config.disposeOnOutsideClick) {
      this.managePortalDisposing(config, overlayRef);
    }

    // create the injector
    const injector = this.createInjector(data, overlayRef, config.config.customProviders);

    // create the component with the injector
    const componentPortal: ComponentPortal<T> =
      new ComponentPortal(component, null, injector);

    // attach the component to the dom
    overlayRef.attach(componentPortal);

    // created the arrow if needed before the main portal so that it is under it
    if (config instanceof FlRelativePortalConfig && config.config.showArrow) {
      this.createArrowPortal(config, overlayRef);
    }

    return overlayRef;
  }

  /**
   * Create the portal on the dom with the configuration
   * @param template template ref to put in portal
   * @param config the portal configuration
   * @param viewContainerRef
   */
  public createPortalTemplate(template: TemplateRef<any>, config: FlPortalConfig, viewContainerRef: ViewContainerRef): FlOverlayRef{
    // we create the overlay
    const overlayRef: FlOverlayRef = this.createOverlay(config.config);

    // manage the portal dispose
    if (config.config.disposeOnBackdropClick || config.config.disposeOnNavigation || config.config.disposeOnOutsideClick) {
      this.managePortalDisposing(config, overlayRef);
    }

    // create the component with the injector
    const componentPortal: TemplatePortal = new TemplatePortal(template, viewContainerRef);

    // attach the component to the dom
    overlayRef.attach(componentPortal);

    // created the arrow if needed before the main portal so that it is under it
    if (config instanceof FlRelativePortalConfig && config.config.showArrow) {
      this.createArrowPortal(config, overlayRef);
    }

    return overlayRef;
  }

  private createOverlay(config: FlOverlayConfig): FlOverlayRef {
    // we create the overlay
    const ref: OverlayRef = this.overlay.create(config);

    // add we create the custom CoreOverlayRef
    return new FlOverlayRef(ref);
  }

  private managePortalDisposing(config: FlPortalConfig, overlayRef: FlOverlayRef): void {
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

    // manage the disposeOnOutsideClick
    let outsideClickListener: () => void;
    if (config.config.disposeOnOutsideClick) {
      // add a listener on the body
      // wait 500 ms before listening to event because it will be called if the portal is opened with a click
      setTimeout(() => {
        outsideClickListener = this.renderer.listen('body', 'mousedown',
          (event: MouseEvent) => this.handleOutsideClick(event, overlayRef));
      }, 0);
    }

    // merge events and unsubscribe on the first emission
    merge(...obs$).pipe(first()).subscribe((val) => {
      // if we received a true --> close the portal
      if (val) {
        overlayRef.dispose();
      }
      // clear the outside click listener if it exists
      if (outsideClickListener) {
        outsideClickListener();
      }
    });
  }

  private handleOutsideClick(event: MouseEvent, overlay: FlOverlayRef): void {
    const wrapper: FlEventWrapper = new FlEventWrapper(event);
    if (!wrapper.elementIsParent(overlay.getPanelElement())) {
      overlay.dispose();
    }
  }

  /**
   * Create the arrow portal pointed to the host element
   * @param mainConfig PortalConfig of the main portal
   * @param mainOverlayRef overlay of the main portal
   */
  private createArrowPortal(mainConfig: FlRelativePortalConfig, mainOverlayRef: FlOverlayRef): void {
    const arrowConfig: FlOverlayConfig = {};

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
    const arrowConfigurer: FlPortalConfig =
      this.configureRelativePortal(mainConfig.hostElement, [defaultPosition], arrowConfig);
    const arrowOverlay: FlOverlayRef = this.createPortal(FlPortalArrowComponent, arrowConfigurer,
      {arrowColor: mainConfig.config.arrowColor, mainConfig: mainConfig});

    // close the arrow portal when the main portal is closed
    mainOverlayRef.detachments().subscribe(
      () => arrowOverlay.dispose()
    );
  }

  // create an injector to send data to the portal and the overlay ref
  private createInjector(data: any, overlayRef: FlOverlayRef, providers: StaticProvider[] = []): Injector {
    const injectionTokens = new WeakMap();
    // send data to the portal
    injectionTokens.set(FL_PORTAL_DATA, data);
    // inject the overlay ref
    injectionTokens.set(FlOverlayRef, overlayRef);

    return Injector.create({
      parent: this.injector, providers: [
        ...providers,
        {provide: FL_PORTAL_DATA, useValue: data},
        {provide: FlOverlayRef, useValue: overlayRef},
      ]
    });
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

  private convertPositionToConnectedPosition(positions: FlPortalConnectedPosition[]): ConnectedPosition[] {
    const connectedPosition: ConnectedPosition[] = [];

    for (const position of positions) {
      if (typeof position === 'string') {
        connectedPosition.push(FlPortalService.getDefaultPosition(position));
      } else {
        connectedPosition.push(position);
      }
    }

    return connectedPosition;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static getDefaultPosition(position: FlPortalDefaultPosition, offsetX: number = 0, offsetY: number = 0): ConnectedPosition {
    // manage default position
    switch (position) {
      case 'right':
        return {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: offsetX,
          offsetY: offsetY
        };
      case 'left':
        return {
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: offsetX,
          offsetY: offsetY
        };
      case 'top':
        return {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetX: offsetX,
          offsetY: offsetY
        };
      case 'bottom':
        return {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetX: offsetX,
          offsetY: offsetY
        };
    }
  }
}

