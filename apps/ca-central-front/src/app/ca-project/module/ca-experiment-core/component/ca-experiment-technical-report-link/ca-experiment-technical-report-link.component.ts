import {Component, Input, OnInit} from '@angular/core';
import {CaTechnicalReportLink} from '../../../../../ca-core/model/entities/project/ca-technical-report.class';

@Component({
  selector: 'ca-experiment-technical-report-link',
  templateUrl: './ca-experiment-technical-report-link.component.html',
  styleUrls: ['./ca-experiment-technical-report-link.component.scss']
})
export class CaExperimentTechnicalReportLinkComponent implements OnInit {

  @Input()
  link: CaTechnicalReportLink;

  constructor() { }

  ngOnInit(): void {
  }

}
