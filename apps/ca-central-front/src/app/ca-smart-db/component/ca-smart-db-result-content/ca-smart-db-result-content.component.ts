import {Component, Input, OnInit} from '@angular/core';
import {CaSmartDbDoc} from '../../model/ca-document.class';
import {CaHighlightTextHelper} from '../../service/ca-highlight-text.helper';

/**
 * Show the result complete abstract with highlighted information
 */
@Component({
  selector: 'ca-smart-db-result-content',
  templateUrl: './ca-smart-db-result-content.component.html',
  styleUrls: ['./ca-smart-db-result-content.component.scss']
})
export class CaSmartDbResultContentComponent implements OnInit {

  @Input() doc: CaSmartDbDoc;

  highlightedContent: string;

  constructor() {
  }

  ngOnInit(): void {
    this.highlightedContent = CaHighlightTextHelper.highlightTexts(this.doc.content.value,
      this.doc.sentences.map(sentence => sentence.sentence.value));
  }

}
