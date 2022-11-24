import {FlDynamicFormAbstractControl} from './fl-dynamic-field-config.class';
import {AbstractControl} from '@angular/forms';

/**
 * Generic type for the Dynamic control components
 */
export interface FlDynamicAbstractFormDirective {

  config: FlDynamicFormAbstractControl;

  control: AbstractControl;

}
