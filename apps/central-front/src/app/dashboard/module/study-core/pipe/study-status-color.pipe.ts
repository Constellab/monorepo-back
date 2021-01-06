import {Pipe, PipeTransform} from '@angular/core';
import {StatusHistory} from '../../../../core/model/entities/status-history.class';
import {getStudyStatusColorClass, Study, StudyStatus} from '../../../../core/model/entities/study.class';

/**
 * Pipe to return color class based on project status
 * It support an input as Study, StatusHistory or StudyStatus
 */
@Pipe({
  name: 'studyStatusColor'
})
export class StudyStatusColorPipe implements PipeTransform {

  transform(value: Study | StatusHistory<StudyStatus> | StudyStatus, mode: 'background' | 'text' = 'background'): string {
    let projectStatus: StudyStatus;
    if (value instanceof Study) {
      projectStatus = value.currentStatus.status;
    } else if (value instanceof StatusHistory) {
      projectStatus = value.status;
    } else {
      projectStatus = value;
    }

    return getStudyStatusColorClass(projectStatus, mode);
  }
}
