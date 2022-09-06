import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaTechnicalReport} from '../../../../../ca-core/model/entities/ca-technical-report.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaExperimentLabConfigDialogComponent
} from '../ca-experiment-lab-config-dialog/ca-experiment-lab-config-dialog.component';
import {
  PrAddProcessWithLink,
  PrConfigEdit,
  PrMenuDynamicButton,
  PrProcess,
  PrWorkflowConnection,
  PrWorkflowMode,
  PrWorkflowNode,
  PrWorkflowNodeProcess,
  PrWorkflowPort
} from '@monorepo/protocol';
import {Observable, of, Subject} from 'rxjs';
import {MatDrawer} from '@angular/material/sidenav';

@Component({
  selector: 'ca-experiment-technical-report',
  templateUrl: './ca-experiment-technical-report.component.html',
  styleUrls: ['./ca-experiment-technical-report.component.scss']
})
export class CaExperimentTechnicalReportComponent implements OnInit {

  @ViewChild(MatDrawer, {static: true}) drawer: MatDrawer;

  @Input()
  experiment: CaExperiment;

  technicalReport: CaTechnicalReport;

  workflowMode$: Observable<PrWorkflowMode>;
  workflowMode: PrWorkflowMode = 'readOnly';

  workflowConfig: CaWorkflowConfig;

  currentNodeSelected: Observable<CaNodeSelected>;

  constructor(
    private experimentService: CaExperimentService,
    private dialogService: FlDialogService
  ) {
  }

  ngOnInit(): void {
    this.experimentService.getExperimentTechnicalReport(this.experiment.id).subscribe((res: CaTechnicalReport) => {
      this.technicalReport = res;
    });

    this.workflowMode$ = of(this.workflowMode);
    this.workflowConfig = new CaWorkflowConfig();

    this.workflowConfig.onNodeSelected$.subscribe((nodeSelected) => {
      this.currentNodeSelected = of(nodeSelected);
      this.drawer.open();
    });
  }

  openLabConfigDialog(): void {
    this.dialogService.openSmallDialog(CaExperimentLabConfigDialogComponent, {data: this.experiment});
  }

}


export class CaWorkflowConfig extends PrConfigEdit {

  onNodeSelected$: Subject<PrWorkflowNodeProcess> = new Subject<PrWorkflowNodeProcess>();

  setInputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess): PrMenuDynamicButton[] {
    return [
      {
        text: {text: 'Test1', translateText: false},
        icon: 'resource',
        onClick: () => {
        },
        disabled: () => this.getWorkflowMode() !== 'edit'
      },
      {
        text: {text: 'Test2', translateText: false},
        icon: 'resource',
        onClick: () => {
        },
        disabled: () => this.getWorkflowMode() === 'edit'
      }
    ];
  }

  setOutputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess): PrMenuDynamicButton[] {
    return [
      {
        text: {text: 'Test1', translateText: false},
        icon: 'resource',
        onClick: () => {
        },
        disabled: () => this.getWorkflowMode() !== 'edit'
      },
      {
        text: {text: 'Test2', translateText: false},
        icon: 'resource',
        onClick: () => {
        },
        disabled: () => this.getWorkflowMode() === 'edit'
      }];
  }

  onAddConnection(connection: PrWorkflowConnection, protocolId: string): void {
  }

  onDeleteConnection(connection: PrWorkflowConnection, protocolId: string): void {
  }

  onDeleteNode(node: PrWorkflowNode, protocolId: string): void {
  }

  saveProcess(typingName: string, protocolId: string): Observable<PrProcess> {
    return undefined;
  }

  saveProcessConnectedToInput(processTypingName: string, processName: string,
                              inputProcessName: string, inputPortName: string): Observable<PrAddProcessWithLink> {
    return undefined;
  }

  saveProcessConnectedToOutput(processTypingName: string, processName: string,
                               outputProcessName: string, outputPortName: string): Observable<PrAddProcessWithLink> {
    return undefined;
  }

  saveSource(resourceId: string, protocolId: string): Observable<PrProcess> {
    return undefined;
  }

  saveSourceToProcessInput(resourceId: string, processNodeName: string,
                           inputPortName: string, resourceName: string): Observable<PrAddProcessWithLink> {
    return undefined;
  }

  saveTaskOutput(processNodeName: string, outputPortName: string): Observable<PrAddProcessWithLink> {
    return undefined;
  }

  onSelectNodeInfo(processNode: PrWorkflowNodeProcess): void {
    this.onNodeSelected$.next(processNode);
  }

}
