import {OverlayConfig} from '@angular/cdk/overlay';
import {InjectionToken} from '@angular/core';

/**
 * @ignore
 * offset to add when using arrow
 */
export const portalArrowOffset: number = 15;

/**
 * Responsive size for overlay
 *
 * hostWidth --> take the width of the host element (not responsive)
 * hostHeight --> take the height of the host element  (not responsive)
 */
export type OverlaySize = 'small' | 'medium' | 'big' | 'full' | 'hostWidth' | 'hostHeight';

/**
 * The configuration to create overlay
 */
export interface CustomOverlayConfig extends OverlayConfig {

  /**
   * If true set the backdrop color to transparent and activate the backdrop
   */
  transparentBackdrop?: boolean;

  /**
   * If true, dispose the overlay on the backdrop click and activate the backdrop
   */
  disposeOnBackdropClick?: boolean;

  /**
   * Add an elevation to the panel (class mat-elevation-z5)
   */
  elevation?: boolean;

  /**
   * Set responsive size on portal
   */
  size?: OverlaySize;

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
}

/**
 * Injection token for the Overlay's Data.
 */
export const PORTAL_DATA = new InjectionToken<any>('PortalData');

/**
 * List of known portal default position to easily set position of the portal
 */
export type PortalDefaultPosition = 'right' | 'left' | 'top' | 'bottom';
