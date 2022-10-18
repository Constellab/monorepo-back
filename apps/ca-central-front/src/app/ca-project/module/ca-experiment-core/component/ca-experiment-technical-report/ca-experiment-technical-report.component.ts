import {Component, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaTechnicalReport} from '../../../../../ca-core/model/entities/ca-technical-report.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaExperimentLabConfigDialogComponent
} from '../ca-experiment-lab-config-dialog/ca-experiment-lab-config-dialog.component';
import {
  PrWorkflow,
  PrWorkflowActionSelectNode,
  PrWorkflowActionState,
  PrWorkflowMode,
  PrWorkflowNodeProcess
} from '@monorepo/protocol';
import {filter, Observable, of, tap} from 'rxjs';
import {MatDrawer} from '@angular/material/sidenav';
import {CaWorkflowConfig} from '../../model/ca-workflow-config.class';
import {ClStringHelper} from '@monorepo/core-lib';
import {map} from 'rxjs/operators';
import {CaLabInstanceService} from '../../../../../ca-core/service-api/ca-lab-instance.service';
import {CaWorkflowFactory} from '../../model/ca-workflow.factory';

@Component({
  selector: 'ca-experiment-technical-report',
  templateUrl: './ca-experiment-technical-report.component.html',
  styleUrls: ['./ca-experiment-technical-report.component.scss']
})
export class CaExperimentTechnicalReportComponent implements OnInit, OnDestroy {

  @ViewChild(MatDrawer, {static: true}) drawer: MatDrawer;

  @Input() experiment: CaExperiment;

  technicalReport: CaTechnicalReport;

  workflow: PrWorkflow;

  workflowMode$: Observable<PrWorkflowMode> = of('readOnly');

  workflowConfig: CaWorkflowConfig;

  currentNodeSelected: Observable<PrWorkflowNodeProcess>;

  constructor(private experimentService: CaExperimentService,
              private dialogService: FlDialogService,
              private actionState: PrWorkflowActionState,
              private labInstanceService: CaLabInstanceService,
              private ngZone: NgZone) {
  }

  ngOnInit(): void {
    this.experimentService.getExperimentTechnicalReport(this.experiment.id).subscribe(
      (res: CaTechnicalReport) => this.onTechnicalReportSuccess(res)
    );

    this.workflowConfig = new CaWorkflowConfig(this.experiment.labInstance);
    this.actionState.init();


    this.currentNodeSelected = this.actionState.getAction$().pipe(
      filter(action => action?.action === 'selectNode'),
      tap(() => this.drawer.open()),
      map(action => (action as PrWorkflowActionSelectNode).processNode)
    );
  }

  openLabConfigDialog(): void {
    this.dialogService.openSmallDialog(CaExperimentLabConfigDialogComponent, {data: this.experiment});
  }

  private onTechnicalReportSuccess(technicalReport: CaTechnicalReport): void {
    this.technicalReport = technicalReport;
    const factory = new CaWorkflowFactory(technicalReport.data.graph, ClStringHelper.generateUUID(),
      this.ngZone);
    this.workflow = factory.createWorkflow();
  }

  ngOnDestroy(): void {
    this.actionState.clear();
    this.workflow?.destroy();
  }
}


