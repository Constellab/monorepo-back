import {Pipe, PipeTransform} from '@angular/core';
import {DateInput} from '../../../model/global/date.class';
import {DateHelper} from '../../../utils/date-helper';

/**
 * Pipe to format dates
 */
@Pipe({
  name: 'coreDate'
})
export class CoreDatePipe implements PipeTransform {

  transform(value: DateInput, format: string = 'D'): string {
    if (value == null) {
      return '';
    }

    return DateHelper.getDate(value).toFormat(format);
  }

}
