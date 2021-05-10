import { Pipe, PipeTransform } from '@angular/core';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';

@Pipe({
  name: 'flYesNo'
})
export class FlYesNoPipe implements PipeTransform {

  constructor(private translateService: FlTranslateService) {
  }

  /**
   * Transform pipe method
   * @param value boolean value
   * @param lowercase if true lowercase the string
   */
  transform(value: boolean, lowercase: boolean = false): string {
    let stringValue: string;
    if (value == null) {
      return null;
    } else if (value) {
      stringValue = this.translateService.translate('yes');
    } else {
      stringValue = this.translateService.translate('no');
    }

    if (lowercase) {
      stringValue = stringValue.toLowerCase();
    }

    return stringValue;
  }
}
