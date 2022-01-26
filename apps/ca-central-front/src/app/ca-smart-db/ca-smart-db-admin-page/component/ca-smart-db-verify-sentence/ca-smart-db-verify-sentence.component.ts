import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaSmartDbSentence} from '../../../model/ca-document.class';

/**
 * Component to verify the sentence and modify it. It directly modifies the object
 */
@Component({
  selector: 'ca-smart-db-verify-sentence',
  templateUrl: './ca-smart-db-verify-sentence.component.html',
  styleUrls: ['./ca-smart-db-verify-sentence.component.scss']
})
export class CaSmartDbVerifySentenceComponent implements OnInit {

  @Input() sentence: CaSmartDbSentence;

  @Output() deleteClicked: EventEmitter<CaSmartDbSentence> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  deleteSentence(): void {
    this.deleteClicked.emit(this.sentence);
  }

  deletePart(index: number): void {
    this.sentence.parts.splice(index, 1);
  }

}
