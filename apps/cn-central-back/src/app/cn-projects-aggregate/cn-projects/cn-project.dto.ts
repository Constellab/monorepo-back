import {CnProject} from './cn-project.entity';
import {CnProjectLevelStatus} from './cn-project-level.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTransform} from '@monorepo/core-lib';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {Type} from 'class-transformer';


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
  storageRegion?: CnCloudProviderRegion;
}

export type CnProjectAncestorType = 'project' | 'experiment' | 'report' | 'document';

export interface CnProjectAncestorTreeDTO {
  id: string;
  title: string;
  type: CnProjectAncestorType;
}

export interface CnProjectTreeDto {
  id: string;
  code: string;
  title: string;
  children: CnProjectTreeDto[];
  levelStatus: CnProjectLevelStatus;
}

export class CnProjectDtoHelper {

  public static convertToProjectTreeDto(project: CnProject): CnProjectTreeDto {
    return {
      id: project.id,
      code: project.code,
      title: project.title,
      children: project.children.map(child => CnProjectDtoHelper.convertToProjectTreeDto(child)),
      levelStatus: project.levelStatus
    };
  }

  public static convertToProjectTreeDtoList(projects: CnProject[]): CnProjectTreeDto[] {
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
