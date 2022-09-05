import {Component, Input, OnInit} from '@angular/core';
import {CaNodeSelected} from '../ca-experiment-technical-report/ca-experiment-technical-report.component';
import {Observable} from 'rxjs';

@Component({
  selector: 'ca-experiment-technical-report-workflow-drawer',
  templateUrl: './ca-experiment-technical-report-workflow-drawer.component.html',
  styleUrls: ['./ca-experiment-technical-report-workflow-drawer.component.scss']
})
export class CaExperimentTechnicalReportWorkflowDrawerComponent implements OnInit {

  @Input()
  nodeSelected$: Observable<CaNodeSelected>;

  drawerWidth: string = '25em'

  constructor() {
  }

  ngOnInit(): void {
  }

}
