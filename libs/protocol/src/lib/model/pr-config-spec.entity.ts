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
import {TdConfigSpec, TdConfigSpecSimple, TdConfigSpecVisibility} from '@monorepo/technical-doc';
import {PrConfigValues} from './pr-config.entity';

/**
 * Record class that contain the list of config spec
 */
export class PrConfigSpecs extends ClRecordWrapper<TdConfigSpec> {
  constructor(record?: Record<string, TdConfigSpec>) {
    super();
    if(record){
      this.record = record;
    }
  }

  record: Record<string, TdConfigSpec>;

  public static empty(): PrConfigSpecs {
    const config = new PrConfigSpecs();
    config.record = {};
    return config;
  }

  /**
   * Method to convert the ConfigSpec to a FlDynamicFormFieldConfig to create a form
   */
  public convertToFieldConfigs(visibility?: TdConfigSpecVisibility): FlDynamicFormGroupConfig {
    return this.convertRecordToFieldConfigs(this.record, visibility);
  }

  public convertRecordToFieldConfigs(record: Record<string, TdConfigSpec>, visibility?: TdConfigSpecVisibility)
    : FlDynamicFormGroupConfig {
    const configs: FlDynamicFormGroupConfig = {
      controlType: 'formGroup',
      subConfigs: {}
    };
    for (const specName in record) {
      const configSpec: TdConfigSpec = record[specName];

      // if a visibility is specified, only get the config for this visibility
      if (visibility && configSpec.visibility !== visibility) continue;
      configs.subConfigs[specName] = this.convertToAbstractConfig(record[specName], specName);
    }

    return configs;
  }

  /**
   * return the complete default config object
   */
  public getDefaultConfig(): PrConfigValues {
    const defaultConfig: PrConfigValues = {};
    for (const specName of Object.keys(this.record)) {
      const spec: TdConfigSpec = this.record[specName];
      if (spec.optional) {
        defaultConfig[specName] = spec.default_value;
      }
    }
    return defaultConfig;
  }

  public hasConfigs(visibility?: TdConfigSpecVisibility): boolean {
    if (visibility == null) {
      return this.record != null && Object.keys(this.record).length > 0;
    } else {
      return this.some(spec => spec.visibility === visibility);
    }
  }


  private convertToAbstractConfig(spec: TdConfigSpec, defaultPlaceholder: string): FlDynamicFormAbstractControl {
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

  private convertToControlConfig(spec: TdConfigSpecSimple, defaultPlaceholder: string): FlDynamicFieldConfig {
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
    } else if (spec.type === 'tags_param') {
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

  private convertToBaseFieldConfig(spec: TdConfigSpec, defaultPlaceholder: string): FlDynamicFieldConfigBase {
    return {
      controlType: 'formControl',
      type: null,
      required: !spec.optional,
      placeholder: spec.human_name ?? defaultPlaceholder,
      hint: spec.short_description,
    };
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

  // get the config value with only null vales
  public getNullConfig(): Record<string, null> {
    const nullConfig: Record<string, null> = {};
    for (const recordKey in this.record) {
      nullConfig[recordKey] = null;
    }
    return nullConfig;
  }
}

