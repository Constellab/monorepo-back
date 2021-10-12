import {Expose} from 'class-transformer';
import {FlEntityPaginatedDatasource, FlFileHelper} from '@monorepo/front-core-lib';
import {BioxResource} from './biox-resource.entity';


export class FileResourcePreview extends BioxResource {

  path: string;

  @Expose({name: 'file_store_uri'})
  fileStoreUri: string;

  name: string;

  getExtension(): string {
    return FlFileHelper.getFileExtension(this.name);
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
  dataIsLabEntity(): boolean {
    return this.data && typeof this.data.uri === 'string' && typeof this.data.typingName === 'string'
      && typeof this.data.data === 'object';
  }
}


export type FileResourceDatasource = FlEntityPaginatedDatasource<FileResourcePreview>;
