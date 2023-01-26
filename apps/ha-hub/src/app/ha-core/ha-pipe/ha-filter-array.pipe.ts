import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'haFilterArray'})
export class HaFilterArrayPipe implements PipeTransform {
  transform(array: any[], filter: string): any[] {
    if(!array) return [];
    if (!filter) return array;

    return array.filter((item) => item.toLowerCase().includes(filter.toLowerCase()));
  }
}
