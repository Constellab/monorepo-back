import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {PrConfig, PrWorkflowNodeProcess, PrWorkflowProcessConfigInfoDialogComponent} from '@monorepo/protocol';
import {FlDialogService} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-experiment-technical-report-workflow-drawer',
  templateUrl: './ca-experiment-technical-report-workflow-drawer.component.html',
  styleUrls: ['./ca-experiment-technical-report-workflow-drawer.component.scss']
})
export class CaExperimentTechnicalReportWorkflowDrawerComponent implements OnInit {

  @Input() nodeSelected$: Observable<PrWorkflowNodeProcess>;

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }


  openConfigInfo(config: PrConfig): void{
    this.dialogService.openMediumDialog(PrWorkflowProcessConfigInfoDialogComponent, {data: config})
  }
}
