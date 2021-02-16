import {Pipe, PipeTransform} from '@angular/core';

/**
 * Simple pipe to log piped value
 */
@Pipe({
  name: 'flDebug'
})
export class FlDebugPipe implements PipeTransform {

  transform(value: any, tag?: string): any {
    if (tag == null) {
      tag = '';
    } else {
      tag += ': ';
    }
    console.log(`%c[${tag}Pipe]`, 'background: #009688; color: #fff; padding: 3px; font-size: 9px;', value);

    return value;
  }

}
