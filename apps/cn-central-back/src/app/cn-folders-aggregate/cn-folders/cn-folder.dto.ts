import { DateTime } from 'luxon';
import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { CnBucket, CnBucketLocationDTO } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { BlTrim } from '@monorepo/back-core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { CnTag } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';
import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';
import {
  CnHierarchyObject,
  CnHierarchyObjectType,
  CnHierarchyObjectWithChildren,
} from '../cn_hierarchy_objects/cn-hierarchy-object.entity';

export class CnSaveFolderDTO {
  @BlTrim()
  name: string;

  @BlTrim()
  code?: string;

  @ClLuxonDateTransform()
  startingDate?: DateTime;
  @ClLuxonDateTransform()
  endingDate?: DateTime;

  mainStorage?: CnBucketLocationDTO;

  backupStorage?: CnBucketLocationDTO;

  tags?: CnTag[];
}

export interface CnFolderStorageLocationDTO {
  mainStorage: CnBucketLocationDTO;

  backupStorage?: CnBucketLocationDTO;
}

export class CnFolderBucketsDTO {
  @Type(() => CnBucket)
  mainStorage: CnBucket;

  @Type(() => CnBucket)
  backupStorage: CnBucket;
}

export interface CnGetFolderDescriptionDTO {
  description: TeRichTextDTO;
  canEdit: boolean; // true if the current user can edit the description
}

export class CnFolderSimpleDTO {
  id: string;
  name: string;
  style: CnTypeStyle;
  parentId: string;
  objectType: CnHierarchyObjectType;

  constructor(folder: CnHierarchyObject) {
    this.id = folder.id;
    this.name = folder.name;
    this.style = folder.style;
    this.parentId = folder.parentId;
    this.objectType = folder.objectType;
  }
}

export class CnFolderWithChildrenDTO extends CnFolderSimpleDTO {
  children: CnFolderWithChildrenDTO[];

  constructor(folder: CnHierarchyObjectWithChildren) {
    super(folder);
    this.children = folder.children.map((c) => new CnFolderWithChildrenDTO(c));
  }
}
