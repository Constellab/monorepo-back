import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {Type} from 'class-transformer';
import {FlDynamicFormGroupConfig} from '@monorepo/front-core-lib';
import {TdConfigSpecVisibility} from '@monorepo/technical-doc';
import {PrBaseEntity} from './pr-entity.entity';
import {PrConfigSpecs} from './pr-config-spec.entity';

export type PrConfigValues = Record<string, any>


/**
 * Config object for a process
 */
export class PrConfigData {

  // object describing the type of the configs and default values
  @ClRecordWrapperTransform(PrConfigSpecs)
  specs: PrConfigSpecs;

  // actual values of the config
  values: PrConfigValues;

  /**
   * Create a ConfigData with defined specs and empty params
   * if the values are not provided, use the default config
   */
  public static fromSpecs(specs: PrConfigSpecs, values?: PrConfigValues): PrConfigData {
    const config = new PrConfigData();
    config.specs = specs;
    config.values = values ?? specs.getDefaultConfig();
    return config;
  }

  /**
   * Merge a config with the default to get the complete config
   * if not all the field are provided
   */
  public mergeConfigWithDefault(): any {
    return this.specs.mergeConfigWithDefault(this.values);
  }

  /**
   * Get a FlDynamicFormFieldConfig based on config spec and params to create a form
   */
  public getDynamicFormFieldsConfig(visibility?: TdConfigSpecVisibility): FlDynamicFormGroupConfig {
    return this.specs.convertToFieldConfigs(visibility);
  }

  public hasConfig(visibility?: TdConfigSpecVisibility): boolean {
    return this.specs.hasConfigs(visibility);
  }

  public updateValues(config: PrConfigValues): void {
    this.values = config;
  }
}


/**
 * Config object for a process
 */
export class PrConfig extends PrBaseEntity {

  // object containing the current configuration values
  @Type(() => PrConfigData)
  data: PrConfigData;

  public updateConfig(config: PrConfigValues): void {
    this.data.updateValues(config);
  }
}



