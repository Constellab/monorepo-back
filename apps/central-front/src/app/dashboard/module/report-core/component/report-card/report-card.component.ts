import {Component, Input, OnInit} from '@angular/core';
import {Report} from '../../../../../core/model/entities/report.class';

/**
 * Simple card to display a report
 */
@Component({
  selector: 'gen-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.scss']
})
export class ReportCardComponent implements OnInit {

  @Input() report: Report;

  constructor() {
  }

  ngOnInit(): void {
  }

}
