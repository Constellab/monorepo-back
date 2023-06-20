import {Injectable, PipeTransform} from '@nestjs/common';
import {plainToClass} from 'class-transformer';

/**
 * Pipe to create an instance of the object and pass it
 * all the values. It uses class-transformer package
 * To support nested parsing, use @Type(() => Class) in nested attribute
 */
@Injectable()
export class BlParsePipe<T> implements PipeTransform {

  constructor(private classReference: new() => T) {
  }

  transform(value: any): T {
    return plainToClass(this.classReference, value);
  }
}
