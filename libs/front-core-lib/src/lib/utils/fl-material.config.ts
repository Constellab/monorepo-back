import {MatFormFieldDefaultOptions} from '@angular/material/form-field';
import {MatTooltipDefaultOptions} from '@angular/material/tooltip';

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
