import {LabBaseEntity} from '../global/lab-entity.entity';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {Type} from 'class-transformer';
import {BioxConfigSpecs, BioxConfigSpecTyped} from './biox-config-spec.entity';

/**
 * Config object for a processable
 */
export class BioxConfigData extends LabBaseEntity {

  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecTyped)
  specs: BioxConfigSpecs;

  params: Record<string, unknown>;

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

  public static empty(): BioxConfig {
    const config = new BioxConfig();
    config.type = 'gws.model.Config';
    return config;
  }
}



