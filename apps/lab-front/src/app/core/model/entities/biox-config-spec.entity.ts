import {ClRecordWrapper} from '@monorepo/core-lib';
import {
  FlDynamicFieldConfig,
  FlDynamicFieldConfigBase,
  FlDynamicFieldConfigBoolean,
  FlDynamicFieldConfigInput,
  FlDynamicFieldConfigList,
  FlDynamicFieldConfigSelect,
  FlDynamicFormAbstractControl,
  FlDynamicFormGroupConfig,
} from '@monorepo/front-core-lib';
import {BioxConfigValues} from './biox-config.entity';

/**
 * Record class that contain the list of config spec
 */
export class BioxConfigSpecs extends ClRecordWrapper<BioxConfigSpec> {
  record: Record<string, BioxConfigSpec>;

  /**
   * Method to convert the BioxConfigSpec to a FlDynamicFormFieldConfig to create a form
   */
  public convertToFieldConfigs(visibility?: BioxConfigSpecVisibility): FlDynamicFormGroupConfig {
    return this.convertRecordToFieldConfigs(this.record, visibility);
  }

  public convertRecordToFieldConfigs(record: Record<string, BioxConfigSpec>, visibility?: BioxConfigSpecVisibility)
    : FlDynamicFormGroupConfig {
    const configs: FlDynamicFormGroupConfig = {
      controlType: 'formGroup',
      subConfigs: {}
    };
    for (const specName in record) {
      const configSpec: BioxConfigSpec = record[specName];

      // if a visibility is specified, only get the config for this visibility
      if (visibility && configSpec.visibility !== visibility) continue;
      configs.subConfigs[specName] = this.convertToAbstractConfig(record[specName], specName);
    }

    return configs;
  }


  private convertToAbstractConfig(spec: BioxConfigSpec, defaultPlaceholder: string): FlDynamicFormAbstractControl {
    if (spec.type === 'param_set') {
      return {
        controlType: 'formArray', formGpConfig: this.convertRecordToFieldConfigs(spec.param_set),
        placeholder: spec.human_name ?? defaultPlaceholder, hint: spec.short_description,
        minSize: spec.optional ? 0 : 1, maxSize: spec.max_number_of_occurrences > 0 ? spec.max_number_of_occurrences : null
      };
    } else {
      return this.convertToControlConfig(spec, defaultPlaceholder);
    }
  }


  private convertToControlConfig(spec: BioxConfigSpecSimple, defaultPlaceholder: string): FlDynamicFieldConfig {
    // create a select
    if (spec.allowed_values) {
      const config: FlDynamicFieldConfigSelect = this.convertToBaseFieldConfig(spec, defaultPlaceholder) as any;
      config.type = 'select';
      config.selectOptions = spec.allowed_values;
      config.suffix = spec.unit;
      return config;
    } else if (spec.type === 'list') {
      const config: FlDynamicFieldConfigList = this.convertToBaseFieldConfig(spec, defaultPlaceholder) as any;
      config.type = 'list';
      return config;
    } else if (spec.type === 'bool') {
      const config: FlDynamicFieldConfigBoolean = this.convertToBaseFieldConfig(spec, defaultPlaceholder) as any;
      config.type = 'boolean';
      return config;
    } else {
      const config: FlDynamicFieldConfigInput = this.convertToBaseFieldConfig(spec, defaultPlaceholder) as any;
      config.type = 'input';
      config.inputType = spec.type === 'str' ? 'text' : 'number';
      config.suffix = spec.unit;


      if (spec.type === 'int' || spec.type === 'float') {
        config.min = spec.min_value;
        config.max = spec.max_value;
        config.integer = spec.type === 'int';
      }
      return config;
    }
  }

  private convertToBaseFieldConfig(spec: BioxConfigSpec, defaultPlaceholder: string): FlDynamicFieldConfigBase {
    return {
      controlType: 'formControl',
      type: null,
      required: !spec.optional,
      placeholder: spec.human_name ?? defaultPlaceholder,
      hint: spec.short_description,
      defaultValue: spec.default_value,
    };
  }

  /**
   * return the complete default config object
   */
  public getDefaultConfig(): BioxConfigValues {
    const defaultConfig: BioxConfigValues = {};
    for (const specName of Object.keys(this.record)) {
      const spec: BioxConfigSpec = this.record[specName];
      if (spec.optional) {
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
    return Object.assign(this.getNullConfig(), this.getDefaultConfig(), config);
  }

  public hasConfigs(visibility?: BioxConfigSpecVisibility): boolean {
    if (visibility == null) {
      return this.record != null && Object.keys(this.record).length > 0;
    } else {
      return this.some(spec => spec.visibility === visibility);
    }
  }

  // get the config value with only null vales
  public getNullConfig(): Record<string, null> {
    const nullConfig: Record<string, null> = {};
    for (const recordKey in this.record) {
      nullConfig[recordKey] = null;
    }
    return nullConfig;
  }
}

/**
 * Object describing the config properties
 */
export type BioxConfigSpec =
  BioxConfigSpecSimple
  | BioxConfigSpecParamSet;

export type BioxConfigSpecSimple =
  BioxConfigSpecString
  | BioxConfigSpecFloat
  | BioxConfigSpecList
  | BioxConfigSpecBoolean;

// If the config property is a string or a float
export type BioxConfigSpecType = 'str' | 'int' | 'float' | 'list' | 'bool' | 'param_set';

export type BioxConfigSpecVisibility = 'protected' | 'public';

// Typed description of the config spec
export class BioxConfigSpecBase {
  /**
   * Type of the config value (string, float...)
   */
  type: BioxConfigSpecType;

  /**
   * If false the config if mandatory
   */
  optional: boolean;

  /**
   * Default value
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

  /**
   * Visibility for the config, if protected, it is considered as advanced option
   */
  visibility: BioxConfigSpecVisibility;
}

export interface BioxConfigSpecString extends BioxConfigSpecBase {

  type: 'str';

  /**
   * If present, the value must be in the array
   */
  allowed_values?: string[];
}

export interface BioxConfigSpecFloat extends BioxConfigSpecBase {

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

export interface BioxConfigSpecBoolean extends BioxConfigSpecBase {
  type: 'bool';
  allowed_values?: void;
}

export interface BioxConfigSpecList extends BioxConfigSpecBase {
  type: 'list';
  allowed_values?: void;
}

export interface BioxConfigSpecParamSet extends BioxConfigSpecBase {
  type: 'param_set';

  param_set: Record<string, BioxConfigSpec>;
  max_number_of_occurrences: number;
}
