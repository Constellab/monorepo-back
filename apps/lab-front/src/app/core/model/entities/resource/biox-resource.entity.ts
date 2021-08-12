import {LabBaseEntity, LabUnconvertedEntity} from '../../global/lab-entity.entity';
import {ViewModel} from '../../global/view-model.entity';
import {FileResource} from './file-resource.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Expose} from 'class-transformer';

export type BioxResource = BioxBasicResource | FileResource;

export class BioxBasicResource<DATA = Record<string, any>> extends LabBaseEntity {

  @Expose({name: 'typing_name'})
  typingName: string

  data: DATA;
}

export type BioxResourceDatasource = FlEntityPaginatedDatasource<LabBaseEntity>

export type BioxResourceVM = ViewModel<BioxResource>;

export class BioxResourceType extends LabBaseEntity {

  @Expose({name: 'typing_name'})
  typingName: string
}

export type BioxResourceTypeDatasource = FlEntityPaginatedDatasource<BioxResourceType>

export interface UnconvertedResource extends LabUnconvertedEntity {
  typing_name: string;
}
