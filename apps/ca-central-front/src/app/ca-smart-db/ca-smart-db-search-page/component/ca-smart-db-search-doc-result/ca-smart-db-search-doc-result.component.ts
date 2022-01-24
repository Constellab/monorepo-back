import {Component, Input, OnInit} from '@angular/core';
import {CaSmartDbDoc, CaSmartDbSentence} from '../../../model/ca-document.class';
import {CaSmartDbSearchPageState} from '../../ca-smart-db-search-page.state';
import {CaHighlightTextHelper} from '../../../service/ca-highlight-text.helper';

@Component({
  selector: 'ca-smart-db-search-doc-result',
  templateUrl: './ca-smart-db-search-doc-result.component.html',
  styleUrls: ['./ca-smart-db-search-doc-result.component.scss']
})
export class CaSmartDbSearchDocResultComponent implements OnInit {

  @Input() doc: CaSmartDbDoc;

  highlights: string[];

  constructor(private state: CaSmartDbSearchPageState) {
  }

  ngOnInit(): void {
    if (this.doc.contentHighlight?.length > 0) {
      this.highlights = this.doc.contentHighlight;
    } else {
      const sentences: CaSmartDbSentence[] = this.doc.sentences.slice(0,2);
      this.highlights = sentences.map(sentence => CaHighlightTextHelper.highlightStringHighlightObject(sentence.sentence));
    }
  }

  selectDoc(): void {
    this.state.selectResult(this.doc);
  }


}
