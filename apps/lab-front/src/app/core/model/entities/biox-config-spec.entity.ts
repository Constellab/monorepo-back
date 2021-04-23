import {ClRecordWrapper} from '@monorepo/core-lib';
import {FlDynamicFormFieldConfig} from '@monorepo/front-core-lib';

/**
 * Record class that contain the list of config spec
 */
export class BioxConfigSpecs extends ClRecordWrapper<BioxConfigSpec> {
  record: Record<string, BioxConfigSpec>;

  /**
   * Methode to the BioxConfigSpec to a FlDynamicFormFieldConfig to create a form
   */
  public convertToFieldConfigs(currentConfig: any = {}): FlDynamicFormFieldConfig[] {
    const configs: FlDynamicFormFieldConfig[] = [];
    for (const specName of Object.keys(this.record)) {
      configs.push(this.convertToFieldConfig(specName, currentConfig[specName] ?? undefined));
    }

    return configs;
  }

  private convertToFieldConfig(fieldName: string, currentConfig?: any): FlDynamicFormFieldConfig {
    const spec: BioxConfigSpec = this.record[fieldName];

    const formFieldConfig: FlDynamicFormFieldConfig = {
      controlName: fieldName,
      initValue: currentConfig !== undefined ? currentConfig : spec.default,
      fieldConfig: null,
      required: !spec.hasDefaultValue() // required if there is no default value
    };

    // create a select
    if (spec.allowed_values) {
      formFieldConfig.fieldConfig = {
        type: 'select',
        placeholder: fieldName,
        selectOptions: spec.allowed_values,
        hint: spec.description,
        suffix: spec.unit,
      };
    }
    // create a input
    else {
      formFieldConfig.fieldConfig = {
        type: 'input',
        placeholder: fieldName,
        inputType: spec.type === 'str' ? 'text' : 'number',
        hint: spec.description,
        suffix: spec.unit
      };
    }

    return formFieldConfig;
  }

  /**
   * return the complete default config object
   */
  public getDefaultConfig(): any {
    const defaultConfig: any = {};
    for (const specName of Object.keys(this.record)) {
      const spec: BioxConfigSpec = this.record[specName];
      if (spec.hasDefaultValue()) {
        defaultConfig[specName] = spec.default;
      }
    }
    return defaultConfig;
  }

  /**
   * Merge a config with the default to get the complete config
   * if not all the field are provided
   */
  public mergeConfigWithDefault(config?: any): any {
    if (config == null) {
      config = {};
    }
    return Object.assign(this.getDefaultConfig(), config);
  }
}

/**
 * Object describing the config properties
 */
export type BioxConfigSpec = BioxConfigSpecTyped<'str', string> | BioxConfigSpecTyped<'float', number>;

// If the config property is a string or a float
export type BioxConfigSpecType = 'str' | 'float';

// Typed description of the config spec
export class BioxConfigSpecTyped<T extends BioxConfigSpecType, H> {

  /**
   * Type of the config value (string, float...)
   */
  type: T;

  /**
   * Default value
   * If not provided, the config is mandatory
   */
  default?: H;

  /**
   * If present, the value must be in the array
   */
  allowed_values?: H[];

  description?: string;

  /**
   * Measure unit of the value (ex km)
   */
  unit?: string;

  public hasDefaultValue(): boolean {
    return this.default !== undefined;
  }
}
