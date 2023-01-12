import {MatLegacyFormFieldDefaultOptions as MatFormFieldDefaultOptions} from '@angular/material/legacy-form-field';
import {MatLegacyTooltipDefaultOptions as MatTooltipDefaultOptions} from '@angular/material/legacy-tooltip';

/**
 * Default configuration for the form-field
 */
export const flMatFormFieldConfig: MatFormFieldDefaultOptions = {
  appearance: 'outline',
  floatLabel: 'auto',
  hideRequiredMarker: false
};

/**
 * Default configuration for the tooltip
 */
export const flTooltipConfig: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 0
};

/**
 * Higher class of a cdk overlay
 */
export const flCdkOverlayContainerClass = 'cdk-overlay-container';
// Panel element of an overlay that is movable and resizable
export const flCdkOverlayPanelClass = 'cdk-overlay-pane';
