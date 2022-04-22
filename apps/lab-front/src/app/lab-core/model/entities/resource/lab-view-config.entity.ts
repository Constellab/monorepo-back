import {LabConfigValues} from '../lab-config.entity';
import {Expose} from 'class-transformer';
import {LabResourceViewType} from './lab-resource-view.entity';
import {LabCallTransformerParams} from '../../global/lab-transformer.class';
import {LabBaseEntityWithUser} from '../lab-user.entity';

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

  transformers: LabCallTransformerParams[];

  resource: {
    id: string;
    name: string;
  };

  experiment?: {
    id: string;
    title: string;
  };
}
