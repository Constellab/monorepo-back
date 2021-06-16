import {LabBaseEntity} from '../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {FlEntityPaginatedDatasource, FlFileHelper} from '@monorepo/front-core-lib';


export class FileResourcePreview extends LabBaseEntity {

  type: 'gws.file.File';

  path: string;

  @Expose({name: 'file_store_uri'})
  fileStoreUri: string;

  getFileName(): string {
    return FlFileHelper.extractFilenameFromFullPath(this.path);
  }

  getExtension(): string {
    return FlFileHelper.getFileExtension(this.path);
  }

  isImage(): boolean {
    return FlFileHelper.extensionIsImage(this.getExtension());
  }
}

/**
 * FileResource containing the actual file and content
 */
export class FileResource extends FileResourcePreview {

  // content of the file
  data: any;

  file: Blob;

  /**
   * return true if the resource data is a json object representing a LabEntity (contains an uri, type and data)
   */
  dataIsLabEntity(): boolean{
    return this.data && typeof this.data.uri === 'string' && typeof this.data.type === 'string'
      && typeof this.data.data === 'object';
  }
}


export type FileResourceDatasource = FlEntityPaginatedDatasource<FileResourcePreview>;
