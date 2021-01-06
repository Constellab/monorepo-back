import {Pipe, PipeTransform} from '@angular/core';
import {getLabInstanceStatusColorClass, LabInstance, LabInstanceStatus} from '../../../../model/entities/lab-instance.class';
import {StatusHistory} from '../../../../model/entities/status-history.class';

/**
 * Pipe to return color class based on lab instance status status
 * It support an input as LabInstance or LabInstanceStatus
 */
@Pipe({
  name: 'labInstanceStatusColor'
})
export class LabInstanceStatusColorPipe implements PipeTransform {

  transform(value: LabInstance | StatusHistory<LabInstanceStatus> | LabInstanceStatus,
            mode: 'background' | 'text' = 'background'): string {
    let status: LabInstanceStatus;
    if (value instanceof LabInstance) {
      status = value.currentStatus.status;
    } else if (value instanceof StatusHistory) {
      status = value.status;
    } else {
      status = value;
    }

    return getLabInstanceStatusColorClass(status, mode);
  }


}
