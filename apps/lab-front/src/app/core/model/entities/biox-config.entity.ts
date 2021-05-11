import {LabBaseEntity} from '../global/lab-entity.entity';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {Type} from 'class-transformer';
import {BioxConfigSpecs, BioxConfigSpecTyped} from './biox-config-spec.entity';

/**
 * Config object for a processable
 */
export class BioxConfigData {

  // object describing the type of the configs
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecTyped)
  specs: BioxConfigSpecs;

  // actual values of the config
  params: Record<string, unknown>;

  /**
   * Create a BioxConfigData with defined specs and empty params
   */
  public static fromSpecs(specs: BioxConfigSpecs): BioxConfigData {
    const config = new BioxConfigData();
    config.specs = specs;
    config.params = {};
    return config;
  }

  /**
   * Merge a config with the default to get the complete config
   * if not all the field are provided
   */
  public mergeConfigWithDefault(): any {
    return this.specs.mergeConfigWithDefault(this.params);
  }
}


/**
 * Config object for a processable
 */
export class BioxConfig extends LabBaseEntity {

  // python class link
  type: 'gws.model.Config';

  // object containing the current configuration values
  @Type(() => BioxConfigData)
  data: BioxConfigData;

  public static fromSpecs(specs: BioxConfigSpecs): BioxConfig {
    const config = new BioxConfig();
    config.type = 'gws.model.Config';
    config.data = BioxConfigData.fromSpecs(specs);
    return config;
  }
}



