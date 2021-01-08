import {Pipe, PipeTransform} from '@angular/core';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';

/**
 * Simple pipe to display an error message generally used in forms.
 *
 * The output string is :  The field [value] is mandatory
 */
@Pipe({
  name: 'flErrorRequired'
})
export class FlErrorRequiredPipe implements PipeTransform {

  constructor(private translateService: FlTranslateService) {
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

