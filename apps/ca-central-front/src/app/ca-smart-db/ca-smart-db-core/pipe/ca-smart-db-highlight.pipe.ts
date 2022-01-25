import {Pipe, PipeTransform} from '@angular/core';
import {CaMatchPosition} from '../../model/ca-document.class';
import {CaHighlightTextHelper} from '../../service/ca-highlight-text.helper';

@Pipe({
  name: 'caSmartDbHighlight'
})
export class CaSmartDbHighlightPipe implements PipeTransform {

  transform(value: string, matchPositions: CaMatchPosition[]): string {
    if (value == null) return null;

    return CaHighlightTextHelper.highlightStringFromPositions(value, matchPositions);
  }

}
