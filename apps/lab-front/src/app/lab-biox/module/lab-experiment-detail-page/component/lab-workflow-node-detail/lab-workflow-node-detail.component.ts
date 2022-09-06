import {Component, OnInit} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';
import {
  LabConfigureSpecsFormDialogComponent,
  LabConfigureSpecsFormDialogInput
} from '../../../../../lab-core/entity-module/lab-config-core/component/lab-configure-specs-form-dialog/lab-configure-specs-form-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {MatExpansionPanel} from '@angular/material/expansion';
import {LabWorkflowNodeDetailState} from '../../state/lab-workflow-node-detail.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabProcess} from '../../../../../lab-core/model/entities/process/lab-process.entity';
import {
  LabTypeDialogComponent,
  LabTypeDialogInput
} from '../../../../../lab-core/entity-module/lab-type-core/component/lab-type-dialog/lab-type-dialog.component';
import {PrWorkflowNodeIo, PrWorkflowNodeProcess} from '@monorepo/protocol';

type ConfigMode = 'config' | 'source' | 'view-task' | 'protocol' | null;

@Component({
  selector: 'lab-workflow-node-detail',
  templateUrl: './lab-workflow-node-detail.component.html',
  styleUrls: ['./lab-workflow-node-detail.component.scss']
})
export class LabWorkflowNodeDetailComponent implements OnInit {

  labProcess$: Observable<LabProcess>;
  node$: Observable<PrWorkflowNodeProcess>;

  configMode$: Observable<ConfigMode>;

  showInputs$: Observable<boolean>;
  showOutput$: Observable<boolean>;
  isEditable$: Observable<boolean>;

  constructor(private dialogService: FlDialogService,
              private experimentState: LabExperimentDetailPageState,
              private nodeDetailState: LabWorkflowNodeDetailState) {
  }

  ngOnInit(): void {
    this.labProcess$ = this.nodeDetailState.getProcess$();
    this.node$ = this.nodeDetailState.getNode$();

    this.configMode$ = this.nodeDetailState.getProcess$().pipe(map(
      process => this.getConfigMode(process)
    ));
    this.isEditable$ = this.experimentState.isEditable$();

    this.showInputs$ = this.nodeDetailState.getNode$().pipe(map(
      node => node.hasInputs() && !(node instanceof PrWorkflowNodeIo)
    ));
    this.showOutput$ = this.nodeDetailState.getNode$().pipe(map(
      node => node.hasOutputs() && !(node instanceof PrWorkflowNodeIo)
    ));
  }

  private getConfigMode(process: LabProcess): ConfigMode {
    if (process.isSource()) return 'source';
    if (process.isViewer()) return 'view-task';
    if (process.isProtocol) return 'protocol';

    return process.hasConfig() ? 'config' : null;
  }

  async openConfig(event: MouseEvent, panel: MatExpansionPanel): Promise<void> {
    ClHelpService.stopEventPropagation(event);

    const process = await this.nodeDetailState.getProcessPromise();
    const input: LabConfigureSpecsFormDialogInput = {
      configData: process.config.data,
      title: 'biox.configuration',
      submitButtonText: 'save'
    };

    this.dialogService.openMediumDialog(LabConfigureSpecsFormDialogComponent,
      {data: input}).afterClosed().subscribe(
      config => this.onConfigDialogClosed(config)
    );

    panel.open();
  }

  private onConfigDialogClosed(config?: any): void {
    if (config != null) {
      // save the config into the value
      this.nodeDetailState.updateConfigValues(config);
    }
  }

  openTypingDoc(typingName: string): void {
    const data: LabTypeDialogInput = {
      typingName: typingName
    };
    this.dialogService.openMediumDialog(LabTypeDialogComponent, {data: data});
  }
}
