import {Pipe, PipeTransform} from '@angular/core';

/**
 * Convert an enum to an Array to loop through it
 */
@Pipe({
  name: 'enumToArray'
})
export class EnumToArrayPipe implements PipeTransform {

  transform(data: object): string[] {
    if (data instanceof Array) {
      return data;
    }
    return Object.keys(data);
  }

}
