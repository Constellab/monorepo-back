import {Pipe, PipeTransform} from '@angular/core';
import {StatusHistory} from '../../../../../core/model/entities/status-history.class';
import {Experiment, ExperimentStatus, getExperimentStatusColorClass} from '../../../../../core/model/entities/experiment.class';

/**
 * Pipe to return color class based on lab instance status status
 * It support an input as Experiment or StatusHistory or ExperimentStatus
 */
@Pipe({
  name: 'experimentStatusColor'
})
export class ExperimentStatusColorPipe implements PipeTransform {

  transform(value: Experiment | StatusHistory<ExperimentStatus> | ExperimentStatus,
            mode: 'background' | 'text' = 'background'): string {
    let status: ExperimentStatus;
    if (value instanceof Experiment) {
      status = value.currentStatus.status;
    } else if (value instanceof StatusHistory) {
      status = value.status;
    } else {
      status = value;
    }

    return getExperimentStatusColorClass(status, mode);
  }

}
