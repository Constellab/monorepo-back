import {LabBaseEntity, LabUnconvertedEntity} from '../../global/lab-entity.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Expose} from 'class-transformer';

export abstract class BioxResource extends LabBaseEntity {
  // typing name of the resource model
  @Expose({name: 'typing_name'})
  typingName: string;

  // typing name of the resource
  @Expose({name: 'resource_typing_name'})
  resourceTypingName: string;

  @Expose({name: 'resource_human_name'})
  resourceHumanName: string;

  data: any;
}

export class BioxBasicResource<DATA = Record<string, any>> extends BioxResource {

  @Expose({name: 'typing_name'})
  typingName: string;

  data: DATA;
}

export type BioxResourceDatasource = FlEntityPaginatedDatasource<LabBaseEntity>


export interface UnconvertedResource extends LabUnconvertedEntity {
  typing_name: string;
}

