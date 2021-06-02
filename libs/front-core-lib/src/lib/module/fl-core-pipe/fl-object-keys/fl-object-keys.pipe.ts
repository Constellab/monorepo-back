import {Pipe, PipeTransform} from '@angular/core';

/**
 * Convert an enum to an Array to loop through it
 *
 * It return the list of keys
 */
@Pipe({
  name: 'flObjectKeys'
})
export class FlObjectKeysPipe implements PipeTransform {

  transform(data: Record<string, unknown>): string[] {
    if (data instanceof Array) {
      return data;
    }
    return Object.keys(data);
  }

}
