import {CnProject} from './cn-project.entity';

export type CnProjectAncestorType = 'project' | 'experiment' | 'report'

export interface CnProjectAncestorTreeDTO {
  id: string;
  title: string;
  type: CnProjectAncestorType;
}

export interface CnProjectTreeDto{
  id: string;
  title: string;
  children: CnProjectTreeDto[];
}

export class CnProjectDtoHelper{

  public static convertToProjectTreeDto(project: CnProject): CnProjectTreeDto{
    return {
      id: project.id,
      title: project.title,
      children: project.children.map(child => CnProjectDtoHelper.convertToProjectTreeDto(child))
    }
  }

  public static convertProjectAncestorTreeDtos(projects: CnProject[]): CnProjectAncestorTreeDTO[]{
    return projects.map(project => ({
      id: project.id,
      title: project.title,
      type: 'project'
    }))
  }
}
