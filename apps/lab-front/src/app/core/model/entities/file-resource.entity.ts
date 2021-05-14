import {LabBaseEntity} from '../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';


export class FileResource extends LabBaseEntity {

  path: string;

  @Expose({name: 'file_store_uri'})
  fileStoreUri: string;
}

export type FileResourceDatasource = FlEntityPaginatedDatasource<FileResource>;
