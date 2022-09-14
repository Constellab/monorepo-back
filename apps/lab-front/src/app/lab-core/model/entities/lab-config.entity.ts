import {LabBaseEntity} from '../global/lab-entity.entity';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {FlDynamicFormGroupConfig} from '@monorepo/front-core-lib';
import {TdConfigSpecVisibility} from '@monorepo/technical-doc';
import {PrConfigSpecs, PrConfigValues} from '@monorepo/protocol';

/**
 * form structure for the {@link LabConfigureSpecsFormComponent}
 */
export interface LabConfigureSpecsForm {
  public: PrConfigValues;
  protected: PrConfigValues;
}


/**
 * Config object for a process
 */
export class LabConfig extends LabBaseEntity {

  // object describing the type of the configs and default values
  @ClRecordWrapperTransform(PrConfigSpecs)
  specs: PrConfigSpecs;

  // actual values of the config
  values: PrConfigValues;

  /**
   * Create a ConfigData with defined specs and empty params
   * if the values are not provided, use the default config
   */
  public static fromSpecs(specs: PrConfigSpecs, values?: PrConfigValues): LabConfig {
    const config = new LabConfig();
    config.specs = specs;
    config.values = values ?? specs.getDefaultConfig();
    return config;
  }

  public updateConfig(config: PrConfigValues): void {
    this.values = config;
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



