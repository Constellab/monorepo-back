import {LabBaseEntity, LabUnconvertedEntity} from '../../global/lab-entity.entity';
import {FileResource} from './file-resource.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Expose} from 'class-transformer';

export type BioxResource = BioxBasicResource | FileResource;

export class BioxBasicResource<DATA = Record<string, any>> extends LabBaseEntity {

  @Expose({name: 'typing_name'})
  typingName: string;

  data: DATA;
}

export type BioxResourceDatasource = FlEntityPaginatedDatasource<LabBaseEntity>


export interface UnconvertedResource extends LabUnconvertedEntity {
  typing_name: string;
}
