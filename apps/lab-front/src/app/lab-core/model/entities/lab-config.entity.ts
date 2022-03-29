import {LabBaseEntity} from '../global/lab-entity.entity';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {Type} from 'class-transformer';
import {LabConfigSpecBase, LabConfigSpecs, LabConfigSpecVisibility} from './lab-config-spec.entity';
import {FlDynamicFormGroupConfig} from '@monorepo/front-core-lib';

export type LabConfigValues = Record<string, any>

/**
 * form structure for the {@link LabConfigureSpecsFormComponent}
 */
export interface LabConfigureSpecsForm {
  public: LabConfigValues;
  protected: LabConfigValues;
}


/**
 * Config object for a process
 */
export class LabConfigData {

  // object describing the type of the configs and default values
  @ClRecordWrapperTransform(LabConfigSpecs, LabConfigSpecBase)
  specs: LabConfigSpecs;

  // actual values of the config
  values: LabConfigValues;

  /**
   * Create a ConfigData with defined specs and empty params
   * if the values are not provided, use the default config
   */
  public static fromSpecs(specs: LabConfigSpecs, values?: LabConfigValues): LabConfigData {
    const config = new LabConfigData();
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
  public getDynamicFormFieldsConfig(visibility?: LabConfigSpecVisibility): FlDynamicFormGroupConfig {
    return this.specs.convertToFieldConfigs(visibility);
  }

  public hasConfig(visibility?: LabConfigSpecVisibility): boolean {
    return this.specs.hasConfigs(visibility);
  }
}


/**
 * Config object for a process
 */
export class LabConfig extends LabBaseEntity {

  // object containing the current configuration values
  @Type(() => LabConfigData)
  data: LabConfigData;
}



