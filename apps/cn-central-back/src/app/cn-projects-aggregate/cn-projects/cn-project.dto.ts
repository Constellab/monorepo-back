import {CnProject} from './cn-project.entity';
import {CnProjectLevelStatus} from './cn-project-level.enum';

export type CnProjectAncestorType = 'project' | 'experiment' | 'report'

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

  public static convertProjectAncestorTreeDtos(projects: CnProject[]): CnProjectAncestorTreeDTO[] {
    return projects.map(project => ({
      id: project.id,
      title: project.code,
      type: 'project',
      levelStatus: project.levelStatus,
    }));
  }
}
