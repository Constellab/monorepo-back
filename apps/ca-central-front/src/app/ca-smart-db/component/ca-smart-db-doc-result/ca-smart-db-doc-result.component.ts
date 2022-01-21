import {Component, Input, OnInit} from '@angular/core';
import {CaSmartDbDoc} from '../../model/ca-document.class';
import {CaSmartDbPageState} from '../../ca-smart-db-page.state';

@Component({
  selector: 'ca-smart-db-doc-result',
  templateUrl: './ca-smart-db-doc-result.component.html',
  styleUrls: ['./ca-smart-db-doc-result.component.scss']
})
export class CaSmartDbDocResultComponent implements OnInit {

  @Input() doc: CaSmartDbDoc;

  constructor(private state: CaSmartDbPageState) {
  }

  ngOnInit(): void {
  }

  selectDoc(): void {
    this.state.selectResult(this.doc);
  }


}
