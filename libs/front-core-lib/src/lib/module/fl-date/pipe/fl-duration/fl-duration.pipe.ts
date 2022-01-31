import {Pipe, PipeTransform} from '@angular/core';
import {ClDateHelper, ClDateScale} from '@monorepo/core-lib';

/**
 * Pipe to make a duration pretty, see {@link ClDateHelper}
 */
@Pipe({
  name: 'flDuration'
})
export class FlDurationPipe implements PipeTransform {

  transform(milliseconds: number, precision: number = 2, maxPrecision: ClDateScale | null = 'seconds'): string {
    return ClDateHelper.toPrettyDuration(milliseconds, precision, maxPrecision);
  }

}
