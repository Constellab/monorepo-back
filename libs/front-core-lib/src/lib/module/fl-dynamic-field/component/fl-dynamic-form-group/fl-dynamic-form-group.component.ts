import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FlDynamicFormAbstractControl, FlDynamicFormGroupConfig} from '../../model/fl-dynamic-field-config.class';
import {FlDynamicAbstractFormDirective} from '../../model/fl-dynamic-abstract-form.directive';

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
  @Input() control: UntypedFormGroup;

  @Input() config: FlDynamicFormGroupConfig;

  @Input() inputFlexGap: string = '0.3em';

  constructor() {
  }

  ngOnInit(): void {
  }

  getControlClass(config: FlDynamicFormAbstractControl): string {
    // different classe based on type
    // if FormGroup or FormArray --> width 100%
    // else width flex 1
    if (config.controlType === 'formControl') {
      if (config.fullWidth) {
        return 'group-container';
      }
      return 'field-container';
    }
    return 'group-container';
  }


}
