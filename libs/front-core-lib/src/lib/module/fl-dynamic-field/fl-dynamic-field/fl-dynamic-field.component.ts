import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FlDynamicFieldConfig,
  FlDynamicFieldConfigInput,
  FlDynamicFieldConfigMaterialInput,
  FlDynamicFieldConfigSelect
} from '../fl-dynamic-field-config.class';
import {FormControl, ValidatorFn, Validators} from '@angular/forms';

/**
 * NgModel component to generate a form field dynamically based on a config
 */
@Component({
  selector: 'fl-dynamic-field',
  templateUrl: './fl-dynamic-field.component.html',
  styleUrls: ['./fl-dynamic-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlDynamicFieldComponent implements OnInit {

  @Input() config: FlDynamicFieldConfig;

  @Input() formCtrl: FormControl;

  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  required: boolean = false;


  ngOnInit(): void {
    this.required = !!this.config.required

    this.formCtrl.patchValue(this.config.initValue);


    this.formCtrl.setValidators(this.getValidators());

    if (this.config.disabled) {
      this.formCtrl.disable();
    }

    this.formCtrl.updateValueAndValidity();
  }

  private getValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (this.required) {
      validators.push(Validators.required);
    }

    if (this.config.type === 'input') {
      if (this.config.min != null) {
        validators.push(Validators.min(this.config.min));
      }
      if (this.config.max != null) {
        validators.push(Validators.max(this.config.max));
      }
    }

    return validators;
  }

  // getter to avoid error in HTML
  get inputConfig(): FlDynamicFieldConfigInput {
    return this.config as FlDynamicFieldConfigInput;
  }

  // getter to avoid error in HTML
  get materialConfig(): FlDynamicFieldConfigMaterialInput {
    return this.config as FlDynamicFieldConfigMaterialInput;
  }

  get selectConfig(): FlDynamicFieldConfigSelect {
    return this.config as FlDynamicFieldConfigSelect;
  }
}
