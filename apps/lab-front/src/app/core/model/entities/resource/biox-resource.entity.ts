import {LabBaseEntity, LabEntity} from '../../global/lab-entity.entity';
import {FlEntityPaginatedDatasource, FlFileHelper} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {BioxTag} from '../biox-tag.entity';

export class FsNodeEntity extends LabEntity {

  // size of the node
  size: number;

  @Expose({name: 'is_file'})
  isFile: boolean;

  name: string;

  isImage(): boolean{
    return FlFileHelper.extensionIsImage(this.getExtension());
  }

  getExtension(): string {
    return FlFileHelper.getFileExtension(this.name);
  }

}

export class BioxResource<DATA = Record<string, any>> extends LabBaseEntity {
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

  @Expose({name: 'resource_human_name'})
  resourceHumanName: string;

  @Type(() => BioxTag)
  tags: BioxTag[];

  @Expose({name: 'fs_node'})
  @Type(() => FsNodeEntity)
  fsNode ?: FsNodeEntity;

  name: string;

  data: DATA;

  isFile(): boolean {
    return this.fsNode != null && this.fsNode.isFile;
  }

  isDownloadable(): boolean {
    return this.isFile();
  }

}


export type BioxResourceDatasource = FlEntityPaginatedDatasource<BioxResource>
