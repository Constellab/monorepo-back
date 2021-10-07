/**
 * Config to create a form based on dynamic fields
 */
export interface FlDynamicFormFieldConfig {
  controlName: string;
  fieldConfig: FlDynamicFieldConfig;
}


/**
 * Configuration for the {@link FlDynamicFieldComponent}
 */
export type FlDynamicFieldConfig = FlDynamicFieldConfigInput | FlDynamicFieldConfigSelect | FlDynamicFieldConfigList;


export interface FlDynamicFieldConfigBase {
  type: 'input' | 'select' | 'list';

  initValue?: any;
  disabled?: boolean;
  required?: boolean;
  placeholder: string;
  hint?: string;
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
}

export interface FlDynamicFieldConfigSelect extends FlDynamicFieldConfigMaterialInput {
  type: 'select';

  selectOptions: any[];
}

export interface FlDynamicFieldConfigList extends FlDynamicFieldConfigMaterialInput {
  type: 'list';
}

