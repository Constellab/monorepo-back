import {LabConfigValues} from '../lab-config.entity';
import {Expose} from 'class-transformer';
import {LabResourceViewType} from './lab-resource-view.entity';
import {RvTransformerParams} from '@monorepo/resource-view';
import {LabEntityWithTag} from '../lab-entity-with-tag.entity';
import {LabFlaggedEntity} from '../../global/lab-flagged-entity.class';

/**
 * Represent a view config that the user viewed
 */
export class LabViewConfig extends LabEntityWithTag implements LabFlaggedEntity {

  title: string;

  @Expose({name: 'view_type'})
  viewType: LabResourceViewType;

  @Expose({name: 'view_name'})
  viewName: string;

  @Expose({name: 'config_values'})
  configValues: LabConfigValues;

  flagged: boolean;

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
