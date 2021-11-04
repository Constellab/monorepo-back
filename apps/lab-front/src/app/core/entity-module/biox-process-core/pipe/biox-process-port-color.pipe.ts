import {Pipe, PipeTransform} from '@angular/core';
import {getBioxProcessPortColor} from '../utils/biox-process-port-color';
import {BioxIOSpec} from '../../../model/entities/biox-io.entity';

@Pipe({
  name: 'bioxProcessPortColor'
})
export class BioxProcessPortColorPipe implements PipeTransform {

  transform(types: BioxIOSpec[]): string {
    return getBioxProcessPortColor(types);
  }

}
