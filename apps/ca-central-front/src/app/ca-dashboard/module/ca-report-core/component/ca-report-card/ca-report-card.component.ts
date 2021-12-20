import {Component, Input, OnInit} from '@angular/core';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';

/**
 * Simple card to display a report
 */
@Component({
  selector: 'ca-report-card',
  templateUrl: './ca-report-card.component.html',
  styleUrls: ['./ca-report-card.component.scss']
})
export class CaReportCardComponent implements OnInit {

  @Input() report: CaReport;

  constructor() {
  }

  ngOnInit(): void {
  }

}
