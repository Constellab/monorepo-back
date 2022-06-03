import {LabConfigValues} from '../lab-config.entity';
import {Expose} from 'class-transformer';
import {LabResourceViewType} from './lab-resource-view.entity';
import {LabBaseEntityWithUser} from '../lab-user.entity';
import {RvTransformerParams} from '@monorepo/resource-view';

/**
 * Represent a view config that the user viewed
 */
export class LabViewConfig extends LabBaseEntityWithUser {

  title: string;

  @Expose({name: 'view_type'})
  viewType: LabResourceViewType;

  @Expose({name: 'view_name'})
  viewName: string;

  @Expose({name: 'config_values'})
  configValues: LabConfigValues;

  transformers: RvTransformerParams[];

  resource: {
    id: string;
    name: string;
  };

  experiment?: {
    id: string;
    title: string;
  };
}
