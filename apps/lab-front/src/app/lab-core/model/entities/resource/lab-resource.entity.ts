import {LabEntity} from '../../global/lab-entity.entity';
import {FlDatasourcePaginated, FlFileHelper} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {LabEntityWithTag} from '../lab-entity-with-tag.entity';
import {TdTypeObjectStatus} from '@monorepo/technical-doc';
import {LabFlaggedEntity} from '../../global/lab-flagged-entity.class';

/**
 * Represent a file or a folder link to the resource
 */
export class LabFsNodeEntity extends LabEntity {

  // size of the node
  size: number;

  @Expose({name: 'is_file'})
  isFile: boolean;

  name: string;

  path: string;

  isImage(): boolean {
    return FlFileHelper.extensionIsImage(this.getExtension());
  }

  getExtension(): string {
    return FlFileHelper.getFileExtension(this.name);
  }
}

export type LabResourceOrigin = 'UPLOADED' | 'GENERATED' | 'IMPORTED' | 'TRANSFORMED'
  | 'ACTIONS' | 'IMPORTED_FROM_LAB';

export class LabResource extends LabEntityWithTag implements LabFlaggedEntity {

  // typing name of the resource
  @Expose({name: 'resource_typing_name'})
  resourceTypingName: string;

  @Expose({name: 'resource_type_human_name'})
  resourceTypeHumanName: string;

  @Expose({name: 'resource_type_short_description'})
  resourceTypeShortDescription: string;

  @Expose({name: 'fs_node'})
  @Type(() => LabFsNodeEntity)
  fsNode ?: LabFsNodeEntity;

  @Expose({name: 'is_downloadable'})
  isDownloadable: boolean;

  origin: LabResourceOrigin;

  name: string;

  @Expose({name: 'has_children'})
  hasChildren: boolean;

  @Expose({name: 'type_status'})
  typeStatus: TdTypeObjectStatus;

  flagged: boolean;

  experiment: {
    id: string;
    title: string;
  };

  isFsNode(): boolean {
    return this.fsNode != null;
  }

  isFile(): boolean {
    return this.isFsNode() && this.fsNode.isFile;
  }

  isUpdatable(): boolean {
    return this.origin === 'UPLOADED';
  }

  isDeletable(): boolean {
    return this.origin !== 'GENERATED';
  }

}


export type LabResourceDatasource = FlDatasourcePaginated<LabResource>
