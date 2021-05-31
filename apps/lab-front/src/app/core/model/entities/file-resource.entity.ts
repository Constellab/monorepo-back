import {LabBaseEntity} from '../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {FlEntityPaginatedDatasource, FlFileService} from '@monorepo/front-core-lib';


export class FileResource extends LabBaseEntity {

  type: 'gws.file.File';

  data: any;

  path: string;

  @Expose({name: 'file_store_uri'})
  fileStoreUri: string;

  getFileName(): string{
    return FlFileService.extractFilenameFromFullPath(this.path);
  }

  getExtension(): string{
    return FlFileService.getFileExtension(this.path);
  }
}

export type FileResourceDatasource = FlEntityPaginatedDatasource<FileResource>;
