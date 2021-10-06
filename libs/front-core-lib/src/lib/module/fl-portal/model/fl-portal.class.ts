import {ConnectedPosition, OverlayConfig} from '@angular/cdk/overlay';
import {InjectionToken, StaticProvider} from '@angular/core';

/**
 * @ignore
 * offset to add when using arrow
 */
export const flPortalArrowOffset: number = 15;

/**
 * Responsive size for overlay
 */
export type FlOverlaySize = 'small' | 'medium' | 'big' | 'full';

/**
 * Size of the portal based on the host element
 * width --> same width as the host element
 * height --> same height as the host element
 * both --> same width and height
 */
export type FlRelativeOverlaySize = 'width' | 'height' | 'both';

export interface FlOverlayConfig extends OverlayConfig {
  /**
   * If true set the backdrop color to transparent and activate the backdrop
   */
  transparentBackdrop?: boolean;

  /**
   * If true, dispose the overlay on the backdrop click and activate the backdrop
   */
  disposeOnBackdropClick?: boolean;

  /**
   * To be used when there is no backdrop. It dispose the portal when a click occurred outside the portal
   * It starts listening to outside click 500 ms after portal opening
   */
  disposeOnOutsideClick?: boolean;

  /**
   * Add an elevation to the panel (class mat-elevation-z5)
   */
  elevation?: boolean;

  /**
   * Set responsive size on portal
   */
  size?: FlOverlaySize;

  /**
   * Custom provider injected in the portal
   */
  customProviders?: StaticProvider[];
}


/**
 * The configuration to create relative overlay
 */
export interface FlRelativeOverlayConfig extends FlOverlayConfig {

  /**
   * Set a size relative to the host element
   */
  hostSize?: FlRelativeOverlaySize;

  /**
   * If true show an arrow that point to the element host
   *
   * Works when the overlay position X or Y is opposed to the host element origin position X or Y
   * Basically the arrow doesn't show if the overlay is over the host element
   */
  showArrow?: boolean;

  /**
   * Color of the arrow, default white
   */
  arrowColor?: string;

  /**
   * margin on the view port borders
   * Default to 20
   */
  viewPortMargin?: number;
}


/**
 * Injection token for the Overlay's Data.
 */
export const FL_PORTAL_DATA = new InjectionToken<any>('FL_PORTAL_DATA');

/**
 * List of known portal default position to easily set position of the portal
 */
export type FlPortalDefaultPosition = 'right' | 'left' | 'top' | 'bottom';

/**
 * Custom connected positions that support default positions
 */
export type FlPortalConnectedPosition = ConnectedPosition | FlPortalDefaultPosition;

/**
 * Object to place portal based on absolute position in css position (px, em...)
 */
export interface PortalAbsolutePosition{
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;

  /**
   * Centers the overlay horizontally with an optional offset.
   * Clears any previously set horizontal position.
   *
   * @param offset Overlay offset from the horizontal center.
   */

  centerHorizontally?: string;
  /**
   * Centers the overlay vertically with an optional offset.
   * Clears any previously set vertical position.
   *
   * @param offset Overlay offset from the vertical center.
   */
  centerVertically?: string;
}
