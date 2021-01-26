import {LabEntity} from '../global/lab-entity.entity';

/**
 * Config object for a job
 */
export class BioxConfig extends LabEntity {

  // python class link
  type: 'gws.model.Config';

  params: Record<string, unknown>;

  public static empty(): BioxConfig {
    const config = new BioxConfig();
    config.type = 'gws.model.Config';
    return config;
  }
}
