import {Pipe, PipeTransform} from '@angular/core';
import {ClDateHelper, ClDateInput} from '@monorepo/core-lib';

/**
 * Pipe to format dates
 */
@Pipe({
  name: 'flDate'
})
export class FlDatePipe implements PipeTransform {

  transform(value: ClDateInput, format: string = 'D'): string {
    if (value == null) {
      return '';
    }

    return ClDateHelper.getDate(value).toFormat(format);
  }

}
