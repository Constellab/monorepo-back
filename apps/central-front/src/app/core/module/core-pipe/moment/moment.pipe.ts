import {Pipe, PipeTransform} from '@angular/core';
import {DateInput} from '../../../model/global/date.class';
import {DateHelper} from '../../../utils/date-helper';

/**
 * Pipe to format moment dates
 */
@Pipe({
  name: 'moment'
})
export class MomentPipe implements PipeTransform {

  transform(value: DateInput, format: string = 'L'): string {
    if (value == null) {
      return '';
    }

    return DateHelper.getMoment(value).format(format);
  }

}
