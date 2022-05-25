import {Pipe, PipeTransform} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Return false if the value is null or an empty string or an empty array or 0
 * @param value to check
 */
@Pipe({
  name: 'flIsNotEmpty'
})
export class FlIsNotEmptyPipe implements PipeTransform {

  transform(value: any): boolean {
    return !ClHelpService.isNullOrEmpty(value);
  }

}
