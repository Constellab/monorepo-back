import {Pipe, PipeTransform} from '@angular/core';
import {labGetProcessPortColor} from '../utils/lab-process-port-color';
import {LabIOSpec} from '../../../model/entities/lab-io.entity';

@Pipe({
  name: 'labProcessPortColor'
})
export class LabProcessPortColorPipe implements PipeTransform {

  transform(types: LabIOSpec): string {
    return labGetProcessPortColor(types);
  }

}
