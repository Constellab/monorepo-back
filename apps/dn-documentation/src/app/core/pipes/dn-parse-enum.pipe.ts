import {BadRequestException, Injectable, PipeTransform} from '@nestjs/common';
import {ErrorText} from '../model/config/dn-error-text.class';

/**
 * pipe to convert an input to a enum and throw an error
 * if the value is not contained in the enum
 */
@Injectable()
export class ParseEnumPipe implements PipeTransform {

  constructor(private enumeration: any) {
  }

  transform(value: any): any {
    for(const property of Object.keys(this.enumeration)){
      if(this.enumeration[property] === value){
        return value;
      }
    }

    // if we couldn't find the enum value
      throw new BadRequestException(ErrorText.INCORRECT_ARGUMENT);
  }
}
