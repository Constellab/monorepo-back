import {Pipe, PipeTransform} from '@angular/core';
import {CaSmartDbDoc} from '../../model/ca-smart-db-doc.class';
import {CaHighlightTextHelper} from '../../service/ca-highlight-text.helper';

/**
 * Pipe to highlight the content of the smartDB doc with sentences
 */
@Pipe({
  name: 'caSmartDbHighlightContent'
})
export class CaSmartDbHighlightContentPipe implements PipeTransform {

  transform(doc: CaSmartDbDoc): string {
    return CaHighlightTextHelper.highlightTexts(doc.content,
      doc.sentences.map(sentence => sentence.sentence));
  }

}
