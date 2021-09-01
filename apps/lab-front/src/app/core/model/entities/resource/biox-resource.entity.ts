import {LabBaseEntity, LabUnconvertedEntity} from '../../global/lab-entity.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Expose} from 'class-transformer';

export abstract class BioxResource extends LabBaseEntity {
  @Expose({name: 'typing_name'})
  typingName: string;

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
