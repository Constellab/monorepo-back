import {Pipe, PipeTransform} from '@angular/core';
import {FlChartScaleI} from '../model/fl-chart-scale.class';

/**
 * Simple pipe to apply a scale on a value
 */
@Pipe({
  name: 'flChartScale'
})
export class FlChartScalePipe implements PipeTransform {

  transform(value: any, scale: FlChartScaleI): any {
    return scale.scale(value);
  }

}
