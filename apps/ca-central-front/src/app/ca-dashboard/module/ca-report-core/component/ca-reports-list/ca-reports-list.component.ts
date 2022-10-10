import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
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
  columns: FlTableColumn<CaReport>[] = ['title', 'createdBy', 'lastSync'];

  constructor() {
  }

  ngOnInit(): void {
  }

}
