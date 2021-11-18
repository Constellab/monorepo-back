import {LabBaseEntity} from '../../global/lab-entity.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {BioxTag} from '../biox-tag.entity';

export class BioxResource<DATA = Record<string, any>> extends LabBaseEntity {
  // typing name of the resource model
  @Expose({name: 'typing_name'})
  typingName: string;

  // typing name of the resource
  @Expose({name: 'resource_typing_name'})
  resourceTypingName: string;

  @Expose({name: 'resource_type_human_name'})
  resourceTypeHumanName: string;

  @Expose({name: 'resource_type_short_description'})
  resourceTypeShortDescription: string;

  @Expose({name: 'resource_human_name'})
  resourceHumanName: string;

  @Type(() => BioxTag)
  tags: BioxTag[];

  name: string;

  data: DATA;
}

export type BioxResourceDatasource = FlEntityPaginatedDatasource<BioxResource>
