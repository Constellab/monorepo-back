import {Pipe, PipeTransform} from '@angular/core';
import {getProjectStatusColorClass, Project, ProjectStatus} from '../../../model/entities/project.class';
import {StatusHistory} from '../../../model/entities/status-history.class';

/**
 * Pipe to return color class based on project status
 * It support an input as Project, StatusHistory or ProjectStatus
 */
@Pipe({
  name: 'projectStatusColor'
})
export class ProjectStatusColorPipe implements PipeTransform {

  transform(value: Project | StatusHistory<ProjectStatus> | ProjectStatus, mode: 'background' | 'text' = 'background'): string {
    let projectStatus: ProjectStatus;
    if (value instanceof Project) {
      projectStatus = value.currentStatus.status;
    } else if (value instanceof StatusHistory) {
      projectStatus = value.status;
    } else {
      projectStatus = value;
    }

    return getProjectStatusColorClass(projectStatus, mode);
  }

}
