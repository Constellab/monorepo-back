/**
 * Config to create a form based on dynamic fields
 */
export interface FlDynamicFormFieldConfig {
  controlName: string;
  fieldConfig: FlDynamicFieldConfig;
  initValue?: any;
  disabled?: boolean;
  required?: boolean;
}


/**
 * Configuration for the {@link FlDynamicFieldComponent}
 */
export type FlDynamicFieldConfig = FlDynamicFieldConfigInput | FlDynamicFieldConfigSelect;


export interface FlDynamicFieldConfigBase {
  type: 'input' | 'select';

  placeholder: string;
  hint?: string;
}

export interface FlDynamicFieldConfigMaterialInput extends FlDynamicFieldConfigBase {
  type: 'input' | 'select';

  prefix?: string;
  suffix?: string;
}

export interface FlDynamicFieldConfigInput extends FlDynamicFieldConfigMaterialInput {
  type: 'input';

  inputType: 'text' | 'number';
}

export interface FlDynamicFieldConfigSelect extends FlDynamicFieldConfigMaterialInput {
  type: 'select';

  selectOptions: any[];
}
