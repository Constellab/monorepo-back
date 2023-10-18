import {CnProject} from './cn-project.entity';
import {CnProjectLevelStatus} from './cn-project-level.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTransform} from '@monorepo/core-lib';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {Type} from 'class-transformer';
import {CnBucket} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';


export class CnSaveProjectDTO {
  code: string;
  title: string;
  levelStatus: CnProjectLevelStatus;

  @ClLuxonDateTransform()
  startingDate: DateTime;
  @ClLuxonDateTransform()
  endingDate: DateTime;

  // only for project level in creation
  @Type(() => CnCloudProviderRegion)
  mainRegion?: CnCloudProviderRegion;

  @Type(() => CnCloudProviderRegion)
  backupRegion?: CnCloudProviderRegion;

}

export type CnProjectAncestorType = 'project' | 'experiment' | 'report' | 'document';

export interface CnProjectAncestorTreeDTO {
  id: string;
  title: string;
  type: CnProjectAncestorType;
}

export interface CnProjectTreeDTO {
  id: string;
  code: string;
  title: string;
  children: CnProjectTreeDTO[];
  levelStatus: CnProjectLevelStatus;
}

export class CnProjectStorageRegionDTO {
  @Type(() => CnCloudProviderRegion)
  mainRegion: CnCloudProviderRegion;

  @Type(() => CnCloudProviderRegion)
  backupRegion: CnCloudProviderRegion;

  constructor(mainRegion?: CnCloudProviderRegion, backupRegion?: CnCloudProviderRegion) {
    this.mainRegion = mainRegion;
    this.backupRegion = backupRegion;
  }
}

export class CnProjectBucketsDTO {
  @Type(() => CnBucket)
  mainStorage: CnBucket;

  @Type(() => CnBucket)
  backupStorage: CnBucket;
}

export class CnProjectDtoHelper {

  public static convertToProjectTreeDto(project: CnProject): CnProjectTreeDTO {
    return {
      id: project.id,
      code: project.code,
      title: project.title,
      children: project.children.map(child => CnProjectDtoHelper.convertToProjectTreeDto(child)),
      levelStatus: project.levelStatus
    };
  }

  public static convertToProjectTreeDtoList(projects: CnProject[]): CnProjectTreeDTO[] {
    return projects.map(project => CnProjectDtoHelper.convertToProjectTreeDto(project));
  }

  public static convertProjectAncestorTreeDtos(projects: CnProject[]): CnProjectAncestorTreeDTO[] {
    return projects.map(project => ({
      id: project.id,
      title: project.code,
      type: 'project',
      levelStatus: project.levelStatus,
    }));
  }
}
