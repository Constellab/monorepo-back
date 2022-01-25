import {Component, Input, OnInit} from '@angular/core';
import {CaSmartDbDoc} from '../../../model/ca-document.class';
import {CaSmartDbSearchPageState} from '../../ca-smart-db-search-page.state';

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
    let highlights: string[];
    if (this.doc.contentHighlight?.length > 0) {
      highlights = this.doc.contentHighlight;
    } else {
      highlights = this.doc.sentences.slice(0, 2).map(sentence => {
        const text = sentence.sentence.value;
        // truncate the long sentences
        if (text.length > 160) {
          return text.substr(0, 150) + '...';
        }
        return text;
      });
    }


    // add '...' for truncate sentences
    for (let i = 0; i < highlights.length; i++) {
      let highlight = highlights[i];

      // if the first letter is not a uppercase, add '...' if front.
      if (highlight[0].toUpperCase() !== highlight[0]) {
        highlight = '...' + highlight;
      }

      // if the last letter is not '.' add '...' at the end
      if (highlight[highlight.length - 1] !== '.') {
        highlight = highlight + '...';
      }

      highlights[i] = highlight;
    }

    this.highlights = highlights;

  }

  selectDoc(): void {
    this.state.selectResult(this.doc.id);
  }


}
