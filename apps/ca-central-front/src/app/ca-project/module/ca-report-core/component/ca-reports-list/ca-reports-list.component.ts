import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {FlTableColumn} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-reports-list',
  templateUrl: './ca-reports-list.component.html',
  styleUrls: ['./ca-reports-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaReportsListComponent implements OnInit {

  @Input() reports$: Observable<CaReport[]>;

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() reportSelected: EventEmitter<CaReport> = new EventEmitter();

  columns: FlTableColumn<CaReport>[] = ['title', 'createdBy', 'lastSync'];

  constructor() {
  }

  ngOnInit(): void {
  }

  selectReport(report: CaReport): void {
    if (this.rowSelectable) {
      this.reportSelected.next(report);
    }
  }
}
