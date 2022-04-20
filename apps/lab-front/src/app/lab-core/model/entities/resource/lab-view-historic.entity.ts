import {LabEntity} from '../../global/lab-entity.entity';
import {LabConfigValues} from '../lab-config.entity';
import {Expose} from 'class-transformer';
import {LabResourceViewType} from './lab-resource-view.entity';

/**
 * Represent a view config that the user viewed
 */
export class LabViewConfig extends LabEntity {

  title: string;

  caption: string;

  @Expose({name: 'view_type'})
  viewType: LabResourceViewType;

  @Expose({name: 'view_name'})
  viewName: string;

  @Expose({name: 'config_values'})
  configValues: LabConfigValues;

  transformers: any[];
}
