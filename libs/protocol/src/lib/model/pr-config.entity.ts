import {PrConfigSpecs} from './pr-config-spec.entity';
import {TdConfigSpecVisibility} from '@monorepo/technical-doc';
import {FlDynamicFormGroupConfig} from '@monorepo/front-core-lib';
import {LabConfigValues} from '../../../../../apps/lab-front/src/app/lab-core/model/entities/lab-config.entity';

// TODO TO REMOVE
export type PrConfigValues = Record<string, any>


/**
 * Config object for a process
 */
export class PrConfig {

  // object describing the type of the configs and default values
  specs: PrConfigSpecs;

  // actual values of the config
  values: PrConfigValues;

  constructor(specs: PrConfigSpecs, values?: PrConfigValues) {
    this.specs = specs;
    this.values = values;
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

  public updateValues(config: LabConfigValues): void {
    this.values = config;
  }

}



