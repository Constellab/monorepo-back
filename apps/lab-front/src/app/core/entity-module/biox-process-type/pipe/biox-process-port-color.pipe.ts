import { Pipe, PipeTransform } from '@angular/core';
import {getBioxProcessPortColor} from '../utils/biox-process-port-color';

@Pipe({
  name: 'bioxProcessPortColor'
})
export class BioxProcessPortColorPipe implements PipeTransform {

  transform(types: string[]): string {
    return getBioxProcessPortColor(types);
  }

}
