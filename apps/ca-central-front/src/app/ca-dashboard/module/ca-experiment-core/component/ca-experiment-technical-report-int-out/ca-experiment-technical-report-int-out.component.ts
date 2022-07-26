import {Component, Input, OnInit} from '@angular/core';
import {CaTechnicalReportIntOut} from '../../../../../ca-core/model/entities/ca-technical-report.class';

@Component({
  selector: 'ca-experiment-technical-report-int-out',
  templateUrl: './ca-experiment-technical-report-int-out.component.html',
  styleUrls: ['./ca-experiment-technical-report-int-out.component.scss']
})
export class CaExperimentTechnicalReportIntOutComponent implements OnInit {

  @Input()
  intOut: CaTechnicalReportIntOut;

  @Input()
  isInterface: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
