import {Pipe, PipeTransform} from '@angular/core';
import {labGetProcessPortColor} from '../utils/lab-process-port-color';
import {TdIOSpecDTO} from '@monorepo/technical-doc';

@Pipe({
  name: 'labProcessPortColor'
})
export class LabProcessPortColorPipe implements PipeTransform {

  transform(types: TdIOSpecDTO): string {
    return labGetProcessPortColor(types);
  }

}
