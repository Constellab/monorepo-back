import {Component, Input, OnInit} from '@angular/core';
import {CaTechnicalReportGraph} from '../../../../../ca-core/model/entities/project/ca-technical-report.class';

@Component({
  selector: 'ca-experiment-technical-report-graph',
  templateUrl: './ca-experiment-technical-report-graph.component.html',
  styleUrls: ['./ca-experiment-technical-report-graph.component.scss']
})
export class CaExperimentTechnicalReportGraphComponent implements OnInit {

  @Input()
  graph: CaTechnicalReportGraph;

  @Input()
  protocolName?: string;

  constructor() { }

  ngOnInit(): void {
  }

}
