import {LabBaseEntity} from '../global/lab-entity.entity';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {Type} from 'class-transformer';
import {BioxConfigSpecBase, BioxConfigSpecs, BioxConfigSpecVisibility} from './biox-config-spec.entity';
import {FlDynamicFormGroupConfig} from '@monorepo/front-core-lib';

/**
 * Config object for a process
 */
export class BioxConfigData {

  // object describing the type of the configs and default values
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecBase)
  specs: BioxConfigSpecs;

  // actual values of the config
  values: Record<string, unknown>;

  /**
   * Create a BioxConfigData with defined specs and empty params
   */
  public static fromSpecs(specs: BioxConfigSpecs, values: any = {}): BioxConfigData {
    const config = new BioxConfigData();
    config.specs = specs;
    config.values = values;
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
  public getDynamicFormFieldsConfig(visibility?: BioxConfigSpecVisibility): FlDynamicFormGroupConfig {
    return this.specs.convertToFieldConfigs(visibility);
  }

  public hasConfig(visibility?: BioxConfigSpecVisibility): boolean {
    return this.specs.hasConfigs(visibility);
  }
}


/**
 * Config object for a process
 */
export class BioxConfig extends LabBaseEntity {

  // object containing the current configuration values
  @Type(() => BioxConfigData)
  data: BioxConfigData;

  public static fromSpecs(specs: BioxConfigSpecs): BioxConfig {
    const config = new BioxConfig();
    config.data = BioxConfigData.fromSpecs(specs);
    return config;
  }
}



