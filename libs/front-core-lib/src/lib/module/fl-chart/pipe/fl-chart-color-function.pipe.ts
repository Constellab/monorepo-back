import {Pipe, PipeTransform} from '@angular/core';
import {FlChartColorFunction} from '../model/scale/fl-chart-scale-color.class';

/**
 * Pipe to execute a FlChartColorFunction
 */
@Pipe({
  name: 'flChartColorFunction'
})
export class FlChartColorFunctionPipe implements PipeTransform {

  transform(value: any, colorFunction: FlChartColorFunction): string {
    return colorFunction(value);
  }

}
