import {ClRecordWrapper} from '@monorepo/core-lib';
import {
  FlDynamicFieldConfig,
  FlDynamicFieldConfigBase,
  FlDynamicFieldConfigBoolean,
  FlDynamicFieldConfigInput,
  FlDynamicFieldConfigList,
  FlDynamicFieldConfigSelect,
  FlDynamicFieldConfigTags,
  FlDynamicFormAbstractControl,
  FlDynamicFormGroupConfig,
} from '@monorepo/front-core-lib';
import {LabConfigValues} from './lab-config.entity';

/**
 * Record class that contain the list of config spec
 */
export class LabConfigSpecs extends ClRecordWrapper<LabConfigSpec> {
  record: Record<string, LabConfigSpec>;

  public static empty(): LabConfigSpecs {
    const config = new LabConfigSpecs();
    config.record = {};
    return config;
  }

  /**
   * Method to convert the ConfigSpec to a FlDynamicFormFieldConfig to create a form
   */
  public convertToFieldConfigs(visibility?: LabConfigSpecVisibility): FlDynamicFormGroupConfig {
    return this.convertRecordToFieldConfigs(this.record, visibility);
  }

  public convertRecordToFieldConfigs(record: Record<string, LabConfigSpec>, visibility?: LabConfigSpecVisibility)
    : FlDynamicFormGroupConfig {
    const configs: FlDynamicFormGroupConfig = {
      controlType: 'formGroup',
      subConfigs: {}
    };
    for (const specName in record) {
      const configSpec: LabConfigSpec = record[specName];

      // if a visibility is specified, only get the config for this visibility
      if (visibility && configSpec.visibility !== visibility) continue;
      configs.subConfigs[specName] = this.convertToAbstractConfig(record[specName], specName);
    }

    return configs;
  }


  private convertToAbstractConfig(spec: LabConfigSpec, defaultPlaceholder: string): FlDynamicFormAbstractControl {
    if (spec.type === 'param_set') {
      return {
        controlType: 'formArray',
        formGpConfig: this.convertRecordToFieldConfigs(spec.param_set),
        placeholder: spec.human_name ?? defaultPlaceholder,
        hint: spec.short_description,
        minSize: spec.optional ? 0 : 1,
        maxSize: spec.max_number_of_occurrences > 0 ? spec.max_number_of_occurrences : null
      };
    } else {
      return this.convertToControlConfig(spec, defaultPlaceholder);
    }
  }


  private convertToControlConfig(spec: LabConfigSpecSimple, defaultPlaceholder: string): FlDynamicFieldConfig {
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
    } else if(spec.type === 'tags_param'){
      const config: FlDynamicFieldConfigTags = this.convertToBaseFieldConfig(spec, defaultPlaceholder) as any;
      config.type = 'tags';
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

  private convertToBaseFieldConfig(spec: LabConfigSpec, defaultPlaceholder: string): FlDynamicFieldConfigBase {
    return {
      controlType: 'formControl',
      type: null,
      required: !spec.optional,
      placeholder: spec.human_name ?? defaultPlaceholder,
      hint: spec.short_description,
    };
  }

  /**
   * return the complete default config object
   */
  public getDefaultConfig(): LabConfigValues {
    const defaultConfig: LabConfigValues = {};
    for (const specName of Object.keys(this.record)) {
      const spec: LabConfigSpec = this.record[specName];
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

  public hasConfigs(visibility?: LabConfigSpecVisibility): boolean {
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
export type LabConfigSpec =
  LabConfigSpecSimple
  | LabConfigSpecParamSet;

export type LabConfigSpecSimple =
  LabConfigSpecString
  | LabConfigSpecFloat
  | LabConfigSpecList
  | LabConfigSpecBoolean
  | LabConfigSpecTags;

// If the config property is a string or a float
export type LabConfigSpecType = 'str' | 'int' | 'float' | 'list' | 'bool' | 'param_set' | 'tags_param';

export type LabConfigSpecVisibility = 'protected' | 'public';

// Typed description of the config spec
export class LabConfigSpecBase{
  /**
   * Type of the config value (string, float...)
   */
  type: LabConfigSpecType;

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
   * Human-readable name for the config
   */
  human_name?: string;

  /**
   * Short description for the config
   */
  short_description?: string;

  /**
   * Visibility for the config, if protected, it is considered as advanced option
   */
  visibility: LabConfigSpecVisibility;
}

export interface LabConfigSpecString extends LabConfigSpecBase {

  type: 'str';

  /**
   * If present, the value must be in the array
   */
  allowed_values?: string[];
}

export interface LabConfigSpecFloat extends LabConfigSpecBase {

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

export interface LabConfigSpecBoolean extends LabConfigSpecBase {
  type: 'bool';
  allowed_values?: void;
}

export interface LabConfigSpecList extends LabConfigSpecBase {
  type: 'list';
  allowed_values?: void;
}

export interface LabConfigSpecParamSet extends LabConfigSpecBase {
  type: 'param_set';

  param_set: Record<string, LabConfigSpec>;
  max_number_of_occurrences: number;
}

export interface LabConfigSpecTags extends LabConfigSpecBase {
  type: 'tags_param';
  allowed_values?: void;
}

