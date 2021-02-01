import {LabEntity} from '../global/lab-entity.entity';
import {FlDynamicFormFieldConfig} from '@monorepo/front-core-lib';

/**
 * Config object for a job
 */
export class BioxConfig extends LabEntity {

  // python class link
  type: 'gws.model.Config';

  params: Record<string, unknown>;

  public static empty(): BioxConfig {
    const config = new BioxConfig();
    config.type = 'gws.model.Config';
    return config;
  }
}

export type BioxConfigSpecs = Record<string, BioxConfigSpec>;

export type BioxConfigSpec = BioxConfigSpecTyped<'str', string> | BioxConfigSpecTyped<'float', number>;

export type BioxConfigSpecType = 'str' | 'float';
export class BioxConfigSpecTyped<T extends BioxConfigSpecType, H> {

  type: T;

  default?: H;

  allowed_values?: H[];

  description?: string;

  /**
   * Measure unit of the value (ex km)
   */
  unit?: string;
}


/**
 * Methode to convert a BioxConfigSpec to a FlDynamicFormFieldConfig to create a form
 */
export function convertBioxConfigSpecToFieldConfig(bioxConfig: BioxConfigSpec, controlName: string): FlDynamicFormFieldConfig {
  const formFieldConfig: FlDynamicFormFieldConfig = {
    controlName: controlName,
    defaultValue: bioxConfig.default,
    fieldConfig: null
  };

  // create a select
  if (bioxConfig.allowed_values) {
    formFieldConfig.fieldConfig = {
      type: 'select',
      placeholder: controlName,
      selectOptions: bioxConfig.allowed_values,
      hint: bioxConfig.description,
      suffix: bioxConfig.unit
    };
  }
  // create a input
  else {
    formFieldConfig.fieldConfig = {
      type: 'input',
      placeholder: controlName,
      inputType: bioxConfig.type === 'str' ? 'text' : 'number',
      hint: bioxConfig.description,
      suffix: bioxConfig.unit
    };
  }

  return formFieldConfig;
}
