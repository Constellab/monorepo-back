import {Pipe, PipeTransform} from '@angular/core';
import {CoreTranslateService} from '../../translate/service/core-translate.service';

/**
 * Simple pipe to display an error message generally used in forms.
 *
 * The output string is :  The field [value] is mandatory
 */
@Pipe({
  name: 'errorRequired'
})
export class ErrorRequiredPipe implements PipeTransform {

  constructor(private translateService: CoreTranslateService) {
  }

  /**
   *
   * @param value field name
   * @param translateValue if true the value is translated
   */
  transform(value: any, translateValue: boolean = true): any {
    if (translateValue) {
      value = this.translateService.translate(value);
    }

    return this.translateService.translate('error_required',
      {param: {field: value}});
  }

}

