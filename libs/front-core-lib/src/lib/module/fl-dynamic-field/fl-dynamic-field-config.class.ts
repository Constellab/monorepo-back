/**
 * Generic config for a FormGroup, FormArray or FormControl
 */
export type FlDynamicFormAbstractControl =
  FlDynamicFormGroupConfig | FlDynamicFormArrayConfig | FlDynamicFieldConfig

/**
 * Base object for configs
 */
interface FlDynamicFormConfigBase {
  controlType: 'formControl' | 'formGroup' | 'formArray';
  placeholder?: string;
  hint?: string;
}

/**
 * Config for a FormGroup
 */
export interface FlDynamicFormGroupConfig extends FlDynamicFormConfigBase {
  controlType: 'formGroup';
  subConfigs: Record<string, FlDynamicFormAbstractControl>;
}

/**
 * Config for a FormArray
 */
export interface FlDynamicFormArrayConfig extends FlDynamicFormConfigBase {
  controlType: 'formArray';
  formGpConfig: FlDynamicFormGroupConfig;
  minSize?: number; // if set the formArray must contains at least minSize number
  maxSize?: number; // if set the formArray can't contains more than maxSize values
}


/**
 * Configuration for a FormControl
 */
export type FlDynamicFieldConfig = FlDynamicFieldConfigInput | FlDynamicFieldConfigSelect | FlDynamicFieldConfigList
  | FlDynamicFieldConfigBoolean;


export interface FlDynamicFieldConfigBase extends FlDynamicFormConfigBase {
  controlType: 'formControl';

  type: 'input' | 'select' | 'list' | 'boolean';

  disabled?: boolean;
  required?: boolean;
  defaultValue?: any;
}

export interface FlDynamicFieldConfigMaterialInput extends FlDynamicFieldConfigBase {
  type: 'input' | 'select' | 'list';

  prefix?: string;
  suffix?: string;

}

export interface FlDynamicFieldConfigInput extends FlDynamicFieldConfigMaterialInput {
  type: 'input';

  inputType: 'text' | 'number';
  // validators (only for numbers)
  min?: number;
  max?: number;
  // if true the number must be an integer
  integer?: boolean;
}

export interface FlDynamicFieldConfigSelect extends FlDynamicFieldConfigMaterialInput {
  type: 'select';

  selectOptions: any[];
}

export interface FlDynamicFieldConfigList extends FlDynamicFieldConfigMaterialInput {
  type: 'list';
}

export interface FlDynamicFieldConfigBoolean extends FlDynamicFieldConfigBase {
  type: 'boolean';
}


