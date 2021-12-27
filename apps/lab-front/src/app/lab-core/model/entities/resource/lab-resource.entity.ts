import {LabEntity} from '../../global/lab-entity.entity';
import {FlDatasourcePaginated, FlFileHelper} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {LabTag} from '../lab-tag.entity';
import {LabBaseEntityWithUser} from '../lab-user.entity';

/**
 * Represent a file or a folder link to the resource
 */
export class LabFsNodeEntity extends LabEntity {

  // size of the node
  size: number;

  @Expose({name: 'is_file'})
  isFile: boolean;

  name: string;

  isImage(): boolean {
    return FlFileHelper.extensionIsImage(this.getExtension());
  }

  getExtension(): string {
    return FlFileHelper.getFileExtension(this.name);
  }
}

export type LabResourceOrigin = 'IMPORTED' | 'GENERATED';

export class LabResource extends LabBaseEntityWithUser {
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

  @Type(() => LabTag)
  tags: LabTag[];

  @Expose({name: 'fs_node'})
  @Type(() => LabFsNodeEntity)
  fsNode ?: LabFsNodeEntity;

  @Expose({name: 'is_importable'})
  isImportable: boolean;

  origin: LabResourceOrigin;

  name: string;

  @Expose({name: 'experiment_id'})
  experimentId?: string;


  isFile(): boolean {
    return this.fsNode != null && this.fsNode.isFile;
  }

  isDownloadable(): boolean {
    return this.isFile();
  }


  isDeletable(): boolean {
    return this.origin === 'IMPORTED';
  }

}


export type LabResourceDatasource = FlDatasourcePaginated<LabResource>
