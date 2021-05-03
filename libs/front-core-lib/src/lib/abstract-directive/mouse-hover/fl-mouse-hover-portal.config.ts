import {ComponentType, ConnectedPosition} from '@angular/cdk/overlay';
import {FlPortalDefaultPosition, FlRelativeOverlayConfig} from '@monorepo/front-core-lib';

/**
 * Config for the {@link FlMouseHoverPortalAbstractDirective}
 */
export interface FlMouseHoverPortalConfig {
  /**
   * Component to open in portal
   */
  component: ComponentType<any>;

  /**
   * Name for the portal HTML Tag name (to handle portal closing)
   */
  portalTagName: string;

  /**
   * Position for the portal
   */
  position: ConnectedPosition[] | FlPortalDefaultPosition;

  /**
   * Config for the overlay. If not provided, use an adapted config for hover portal
   */
  overlayConfig?: FlRelativeOverlayConfig;

  /**
   * Portal data
   */
  data?: any;
}
