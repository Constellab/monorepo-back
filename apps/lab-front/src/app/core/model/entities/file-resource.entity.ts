import {LabBaseEntity} from '../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {FlEntityPaginatedDatasource, FlFileService} from '@monorepo/front-core-lib';


export class FileResourcePreview extends LabBaseEntity {

  type: 'gws.file.File';

  path: string;

  @Expose({name: 'file_store_uri'})
  fileStoreUri: string;

  getFileName(): string {
    return FlFileService.extractFilenameFromFullPath(this.path);
  }

  getExtension(): string {
    return FlFileService.getFileExtension(this.path);
  }

  isImage(): boolean {
    return FlFileService.extensionIsImage(this.getExtension());
  }
}

/**
 * FileResource containing the actual file and content
 */
export class FileResource extends FileResourcePreview {

  // content of the file
  data: any;

  file: Blob;
}

export type FileResourceDatasource = FlEntityPaginatedDatasource<FileResourcePreview>;
