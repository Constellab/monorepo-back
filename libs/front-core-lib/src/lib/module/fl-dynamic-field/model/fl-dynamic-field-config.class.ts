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
  minSize?: number; // if set the formArray must contain at least minSize number
  maxSize?: number; // if set the formArray can't contain more than maxSize values
  newElementDefaultValue?: any; // value used to initialize a new element in the array
}


/**
 * Configuration for a FormControl
 */
export type FlDynamicFieldConfig = FlDynamicFieldConfigInput | FlDynamicFieldConfigSelect | FlDynamicFieldConfigList
  | FlDynamicFieldConfigBoolean | FlDynamicFieldConfigTextArea | FlDynamicFieldConfigUnknown;


export interface FlDynamicFieldConfigBase extends FlDynamicFormConfigBase {
  controlType: 'formControl';

  type: 'input' | 'select' | 'list' | 'boolean' | string;

  disabled?: boolean;
  required?: boolean;

  // when true force the field to take full width on the page if included in group
  fullWidth?: boolean;
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

export interface FlDynamicFieldConfigTextArea extends FlDynamicFieldConfigBase {
  type: 'textarea';
}

// use for additional type configured outside the library
export interface FlDynamicFieldConfigUnknown extends FlDynamicFieldConfigBase {
  type: string;
}


