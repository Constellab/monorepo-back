import {Pipe, PipeTransform} from '@angular/core';
import {ClDateHelper, ClDateInput} from '@monorepo/core-lib';

/**
 * Convert a Date to text such as '5 days ago' or 'il y a 5 secondes'
 *
 * Use the date local setup by the translate service
 */
@Pipe({
  name: 'flFromNow'
})
export class FlFromNowPipe implements PipeTransform {

  /**
   * Convert a Date to text such as '5 days ago'
   *
   * Use the date local setup by the translate service
   * @param date date
   * @param capitalize if true capitalize string
   */
  transform(date: ClDateInput, capitalize: boolean = false): string {
    return ClDateHelper.fromNow(date, capitalize);
  }

}
