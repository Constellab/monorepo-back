import {Pipe, PipeTransform} from '@angular/core';
import {CaSearchStringHighlight} from '../../model/ca-document.class';
import {CaHighlightTextHelper} from '../../service/ca-highlight-text.helper';

@Pipe({
  name: 'caSmartDbHighlight'
})
export class CaSmartDbHighlightPipe implements PipeTransform {

  transform(value: CaSearchStringHighlight): string {
    if (value == null) return null;

    return CaHighlightTextHelper.highlightStringHighlightObject(value);
  }

}
