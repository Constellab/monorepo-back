import {Component, Inject, OnInit} from '@angular/core';
import {CaSmartDbSentence} from '../../../model/ca-smart-db-doc.class';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

/**
 * Portal to show the detail of a sentence
 */
@Component({
  selector: 'ca-smart-db-sentence-detail',
  templateUrl: './ca-smart-db-sentence-detail.component.html',
  styleUrls: ['./ca-smart-db-sentence-detail.component.scss']
})
export class CaSmartDbSentenceDetailComponent implements OnInit {

  sentence: CaSmartDbSentence;

  constructor(@Inject(FL_PORTAL_DATA) sentence: CaSmartDbSentence) {
    this.sentence = sentence;
  }

  ngOnInit(): void {
  }

  hasContext(): boolean{
    return this.sentence.context?.length > 0 ?? false;
  }

}
