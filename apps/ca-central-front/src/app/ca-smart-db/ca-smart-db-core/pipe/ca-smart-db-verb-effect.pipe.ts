import {Pipe, PipeTransform} from '@angular/core';
import {CaSmartDbEffect} from '../../model/ca-document.class';

/**
 * Pipe to color the verb of a SmartDb sentence based on Effect
 */
@Pipe({
  name: 'caSmartDbVerbEffect'
})
export class CaSmartDbVerbEffectPipe implements PipeTransform {

  transform(effect: CaSmartDbEffect): string {
    if (effect === 'Positive') {
      return 'g-success-text'
    } else if (effect === 'Negative') {
      return 'g-warn-text'
    } else {
      return null;
    }
  }

}
