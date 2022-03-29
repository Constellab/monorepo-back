import {Pipe, PipeTransform} from '@angular/core';
import {FlColorHelper} from '../../../../utils/fl-color-helper.class';

/**
 * Convert a string to RGB color
 */
@Pipe({
  name: 'flStringToRgb'
})
export class FlStringToRgbPipe implements PipeTransform {

  transform(value: any, defaultColor: string = 'transparent'): unknown {
    if (value == null) {
      return defaultColor;
    }

    if (typeof value !== 'string') {
      value = value.toString();
    }
    return FlColorHelper.stringToRGBColor(value);
  }

}
