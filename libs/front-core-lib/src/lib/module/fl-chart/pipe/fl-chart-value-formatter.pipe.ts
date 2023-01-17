import {Pipe, PipeTransform} from '@angular/core';
import {FlChartLabelFormatter} from '../model/fl-chart-label-formatter.class';

/**
 * Pipe to call a formatter on a value
 */
@Pipe({
  name: 'flChartValueFormatter'
})
export class FlChartValueFormatterPipe implements PipeTransform {

  transform(value: number, formatter: FlChartLabelFormatter,
            text: 'short' | 'long' = 'short'): string {
    if (text === 'short') {
      return formatter.formatShort(value);
    }
    return formatter.formatLong(value);
  }

}
