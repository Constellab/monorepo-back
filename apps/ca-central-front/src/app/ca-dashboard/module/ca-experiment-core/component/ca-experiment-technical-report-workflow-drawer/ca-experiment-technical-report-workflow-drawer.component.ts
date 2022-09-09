import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {PrWorkflowNodeProcess} from '@monorepo/protocol';

@Component({
  selector: 'ca-experiment-technical-report-workflow-drawer',
  templateUrl: './ca-experiment-technical-report-workflow-drawer.component.html',
  styleUrls: ['./ca-experiment-technical-report-workflow-drawer.component.scss']
})
export class CaExperimentTechnicalReportWorkflowDrawerComponent implements OnInit {

  @Input() nodeSelected$: Observable<PrWorkflowNodeProcess>;

  constructor() {
  }

  ngOnInit(): void {
  }

}
