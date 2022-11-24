import {FormControl} from '@angular/forms';
import {Directive, Input} from '@angular/core';

/**
 * Generic type for the Dynamic control components
 */
@Directive()
export class FlDynamicFieldAbstractDirective {

  @Input() formCtrl: FormControl;

  @Input() placeholder: string;

  @Input() hint: string;

  @Input() disabled: boolean;

  @Input() required: boolean;

}
