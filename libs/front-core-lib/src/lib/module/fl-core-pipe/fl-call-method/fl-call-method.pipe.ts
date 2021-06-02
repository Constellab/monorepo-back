import {Pipe, PipeTransform} from '@angular/core';

/**
 * Pipe use to call method on a object. The method is only called when the
 * the object reference is changed. The object passed must be the object containing the method
 * This does not work with getter
 *
 * Example : user | flCallMethod:user.getFullname
 */
@Pipe({
  name: 'flCallMethod'
})
export class FlCallMethodPipe implements PipeTransform {

  transform(object: any, method: () => any): any {
    return method.bind(object)();
  }

}
