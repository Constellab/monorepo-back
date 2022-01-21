import {Component, OnInit} from '@angular/core';
import {CaSmartDbPageState} from '../../ca-smart-db-page.state';
import {Observable} from 'rxjs';
import {CaSmartDbDoc} from '../../model/ca-document.class';

/**
 * Component inside SmartDb search to show the selected doc
 */
@Component({
  selector: 'ca-smart-db-selected-doc',
  templateUrl: './ca-smart-db-selected-doc.component.html',
  styleUrls: ['./ca-smart-db-selected-doc.component.scss']
})
export class CaSmartDbSelectedDocComponent implements OnInit {

  doc$: Observable<CaSmartDbDoc>;

  constructor(private state: CaSmartDbPageState) {
  }

  ngOnInit(): void {
    this.doc$ = this.state.getSelectedResult$();
  }

}
