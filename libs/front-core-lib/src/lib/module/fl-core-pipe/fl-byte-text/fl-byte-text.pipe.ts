import {Pipe, PipeTransform} from '@angular/core';
import {FlFileHelper} from '../../../service/fl-file.helper';

/**
 * Pipe to transform a number to a byte value like 55MB
 */
@Pipe({
  name: 'flByteText'
})
export class FlByteTextPipe implements PipeTransform {

  transform(value: number): string {
    return FlFileHelper.getFileSizeText(value);
  }

}
