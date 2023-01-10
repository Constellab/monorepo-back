import {Pipe, PipeTransform} from '@angular/core';
import {TdTypingName} from '../model/td-typing-name.class';

/**
 * Simple pipe to convert a typing name str to TypingName
 */
@Pipe({
  name: 'tdTypingName'
})
export class TdTypingNamePipe implements PipeTransform {

  transform(value: string | TdTypingName): TdTypingName {
    if (value == null) {
      return new TdTypingName('');
    }
    if (value instanceof TdTypingName) {
      return value;
    }
    return new TdTypingName(value);
  }

}
