import {BadRequestException, Injectable, PipeTransform} from '@nestjs/common';
import {ErrorText} from '../model/config/error-text.class';

/**
 * pipe to convert an input to a enum and throw an error
 * if the value is not contained in the enum
 */
@Injectable()
export class ParseEnumPipe implements PipeTransform {

  constructor(private enumeration: any) {
  }

  transform(value: any): any {
    const enumElement = this.enumeration[value];

    if (enumElement == null) {
      throw new BadRequestException(ErrorText.INCORRECT_ARGUMENT);
    }

    return enumElement;
  }
}
