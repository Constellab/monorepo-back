import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FlDynamicFormAbstractControl, FlDynamicFormGroupConfig} from '../fl-dynamic-field-config.class';
import {FlDynamicAbstractFormDirective} from '../fl-dynamic-abstract-form.directive';

/**
 * Component to create dynamic form group
 */
@Component({
  selector: 'fl-dynamic-form-group',
  templateUrl: './fl-dynamic-form-group.component.html',
  styleUrls: ['./fl-dynamic-form-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlDynamicFormGroupComponent implements OnInit, FlDynamicAbstractFormDirective {

  /**
   * Form where control will be added
   */
  @Input() control: FormGroup;

  @Input() config: FlDynamicFormGroupConfig;

  // width of the input, used in a fxFlex
  @Input() inputFlexWidth: string = '1 1 49%';

  @Input() inputFlexGap: string = '1%';

  constructor() {
  }

  ngOnInit(): void {
  }

  getFlexWidth(config: FlDynamicFormAbstractControl): string {
    // use the input flex width only when the child is a FormControl
    return config.controlType === 'formControl' ? this.inputFlexWidth : '1 1 100%';
  }


}
