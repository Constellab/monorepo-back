import {ClRecordWrapper} from '@monorepo/core-lib';
import {
  FlDynamicFieldConfigBase,
  FlDynamicFieldConfigBoolean,
  FlDynamicFieldConfigInput,
  FlDynamicFieldConfigList,
  FlDynamicFieldConfigSelect,
  FlDynamicFormFieldConfig
} from '@monorepo/front-core-lib';

/**
 * Record class that contain the list of config spec
 */
export class BioxConfigSpecs extends ClRecordWrapper<BioxConfigSpec> {
  record: Record<string, BioxConfigSpec>;

  /**
   * Method to convert the BioxConfigSpec to a FlDynamicFormFieldConfig to create a form
   */
  public convertToFieldConfigs(currentConfig: Record<string, unknown> = {}): FlDynamicFormFieldConfig[] {
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
      fieldConfig: null,
    };

    // create a select
    if (spec.allowed_values) {
      const config: FlDynamicFieldConfigSelect = this.convertToBaseFieldConfig(spec, fieldName, currentConfig) as any;
      config.type = 'select';
      config.selectOptions = spec.allowed_values;
      config.suffix = spec.unit;
      formFieldConfig.fieldConfig = config;
    } else if (spec.type === 'list') {
      const config: FlDynamicFieldConfigList = this.convertToBaseFieldConfig(spec, fieldName, currentConfig) as any;
      config.type = 'list';
      formFieldConfig.fieldConfig = config;
    } else if (spec.type === 'bool') {
      const config: FlDynamicFieldConfigBoolean = this.convertToBaseFieldConfig(spec, fieldName, currentConfig) as any;
      config.type = 'boolean';
      formFieldConfig.fieldConfig = config;
    } else {
      const config: FlDynamicFieldConfigInput = this.convertToBaseFieldConfig(spec, fieldName, currentConfig) as any;
      config.type = 'input';
      config.inputType = spec.type === 'str' ? 'text' : 'number';
      config.suffix = spec.unit;


      if (spec.type === 'int' || spec.type === 'float') {
        config.min = spec.min_value;
        config.max = spec.max_value;
      }
      formFieldConfig.fieldConfig = config;
    }
    return formFieldConfig;
  }

  private convertToBaseFieldConfig(spec: BioxConfigSpec, fieldName: string, currentConfig?: any): FlDynamicFieldConfigBase {
    return {
      type: null,
      initValue: currentConfig !== undefined ? currentConfig : spec.default_value,
      required: !spec.hasDefaultValue(),// required if there is no default value
      placeholder: spec.human_name ?? fieldName,
      hint: spec.short_description,
    };
  }

  /**
   * return the complete default config object
   */
  public getDefaultConfig(): any {
    const defaultConfig: any = {};
    for (const specName of Object.keys(this.record)) {
      const spec: BioxConfigSpec = this.record[specName];
      if (spec.hasDefaultValue()) {
        defaultConfig[specName] = spec.default_value;
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

  public hasConfigs(): boolean {
    return this.record != null && Object.keys(this.record).length > 0;
  }
}

/**
 * Object describing the config properties
 */
export type BioxConfigSpec = BioxConfigSpecString | BioxConfigSpecFloat | BioxConfigSpecList | BioxConfigSpecBoolean;

// If the config property is a string or a float
export type BioxConfigSpecType = 'str' | 'int' | 'float' | 'list' | 'bool';

// Typed description of the config spec
export class BioxConfigSpecBase {
  /**
   * Type of the config value (string, float...)
   */
  type: BioxConfigSpecType;

  /**
   * Default value
   * If not provided, the config is mandatory
   */
  default_value?: any;

  /**
   * Measure unit of the value (ex km)
   */
  unit?: string;

  /**
   * Human readable name for the config
   */
  human_name?: string;

  /**
   * Short description for the config
   */
  short_description?: string;

  public hasDefaultValue(): boolean {
    return this.default_value !== undefined;
  }
}

export class BioxConfigSpecString extends BioxConfigSpecBase {

  type: 'str';

  /**
   * If present, the value must be in the array
   */
  allowed_values?: string[];
}

export class BioxConfigSpecFloat extends BioxConfigSpecBase {

  type: 'int' | 'float';

  /**
   * If present, the value must be in the array
   */
  allowed_values?: string[];

  // min value validator
  min_value: number;

  // max value validator
  max_value: number;
}

export class BioxConfigSpecBoolean extends BioxConfigSpecBase {
  type: 'bool';
  allowed_values?: void;
}

export class BioxConfigSpecList extends BioxConfigSpecBase {
  type: 'list';
  allowed_values?: void;
}
