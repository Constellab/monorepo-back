import {Injectable, PipeTransform} from '@nestjs/common';
import {BlBadRequestException} from '../exceptions/bl-bad-request.exception';

/**
 * pipe to convert an input to a enum and throw an error
 * if the value is not contained in the enum
 * TODO in nest version 8, a parse enum pipe exists (chick if this one is necessary)
 */
@Injectable()
export class BlParseEnumPipe implements PipeTransform {

  constructor(private enumeration: any) {
  }

  transform(value: any): any {
    for (const property of Object.keys(this.enumeration)) {
      if (this.enumeration[property] === value) {
        return value;
      }
    }

    // if we couldn't find the enum value
    throw new BlBadRequestException('error.incorrect_argument');
  }
}
