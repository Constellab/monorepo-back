import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  FlDynamicFieldConfig,
  FlDynamicFieldConfigInput,
  FlDynamicFormAbstractControl,
  FlDynamicFormArrayConfig,
  FlDynamicFormGroupConfig
} from './fl-dynamic-field-config.class';
import {FlGlobalValidators} from '../../../utils/fl-global.validators';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Helper to generate AbstractControl based on FlDynamicConfig
 */
export class FlDynamicFormHelper {

  public static generateForm(config: FlDynamicFormAbstractControl, value: any = null): AbstractControl {
    switch (config.controlType) {
      case 'formControl':
        return FlDynamicFormHelper.generateFormControl(config, value);
      case 'formGroup':
        return FlDynamicFormHelper.generateFormGroup(config, value);
      case 'formArray':
        return FlDynamicFormHelper.generateFormArray(config, value);
    }
  }

  public static generateFormGroup(config: FlDynamicFormGroupConfig, value: any = {}): UntypedFormGroup {
    const formGroup: UntypedFormGroup = new UntypedFormGroup({});

    for (const key in config.subConfigs) {
      const val = value ? value[key] : null;
      formGroup.addControl(key, FlDynamicFormHelper.generateForm(config.subConfigs[key], val));
    }
    return formGroup;
  }

  public static generateFormArray(config: FlDynamicFormArrayConfig, values: any[] = []): UntypedFormArray {
    const formArray: UntypedFormArray = new UntypedFormArray([]);

    if (values) {
      for (const value of values) {
        FlDynamicFormHelper.addFormGroupToFormArray(formArray, config, value);
      }
    }

    // add values to reach the min size
    if (config.minSize != null && formArray.length < config.minSize) {
      for (let i = 0; i < config.minSize; i++) {
        FlDynamicFormHelper.addFormGroupToFormArray(formArray, config, ClHelpService.deepClone(config.newElementDefaultValue));
      }
    }

    return formArray;
  }

  public static addFormGroupToFormArray(formArray: UntypedFormArray, config: FlDynamicFormArrayConfig, value: any = null): void {
    formArray.push(FlDynamicFormHelper.generateForm(config.formGpConfig, value));
  }


  public static generateFormControl(config: FlDynamicFieldConfig, value: any = null): UntypedFormControl {
    const control = new UntypedFormControl(value, FlDynamicFormHelper.getControlValidators(config));

    if (config.disabled) {
      control.disable();
    }

    return control;
  }

  private static getControlValidators(config: FlDynamicFieldConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (config.required) {
      validators.push(Validators.required);
    }

    if (config.type === 'input') {
      const inputConfig: FlDynamicFieldConfigInput = config as FlDynamicFieldConfigInput;
      if (inputConfig.min != null) {
        validators.push(Validators.min(inputConfig.min));
      }
      if (inputConfig.max != null) {
        validators.push(Validators.max(inputConfig.max));
      }
      if (inputConfig.integer) {
        validators.push(FlGlobalValidators.isInteger());
      }
    }

    return validators;
  }

}
