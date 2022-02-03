import {Component, OnInit} from '@angular/core';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabExperimentService} from '../../../../../lab-core/entity-service/lab-experiment.service';
import {LabExperiment} from '../../../../../lab-core/model/entities/lab-experiment.entity';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {
  LabSelectProcessTypeDialogComponent
} from '../../../../../lab-core/entity-module/lab-type-core/component/lab-select-process-type-dialog/lab-select-process-type-dialog.component';
import {LabTypeEntity} from '../../../../../lab-core/model/entities/lab-type/lab-type.entity';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {Observable} from 'rxjs';

/**
 * Actions button for the workflow
 */
@Component({
  selector: 'lab-workflow-actions',
  templateUrl: './lab-workflow-actions.component.html',
  styleUrls: ['./lab-workflow-actions.component.scss']
})
export class LabWorkflowActionsComponent implements OnInit {

  saveIsLoading: boolean = false;
  startIsLoading: boolean = false;

  experiment$: Observable<LabExperiment>;

  constructor(private workflowManager: LabWorkflowManagerState,
              private experimentService: LabExperimentService,
              private snackBarService: FlSnackBarService,
              private dialogService: FlDialogService,
              private experimentState: LabExperimentDetailPageState) {
  }

  ngOnInit(): void {
    this.experiment$ = this.experimentState.getExperiment$();

  }

  get isLoading(): boolean {
    return this.saveIsLoading || this.startIsLoading;
  }

  addProcess(): void {
    this.dialogService.openBigDialog(LabSelectProcessTypeDialogComponent).afterClosed().subscribe(
      processType => this.onSelectTypeClosed(processType)
    );
  }

  private onSelectTypeClosed(processType ?: LabTypeEntity): void {
    if (processType) {
      this.workflowManager.addProcessNode(processType.typingName, processType.name);
    }
  }

  addInterface(): void {
    this.workflowManager.addInterface();
  }

  addOuterface(): void {
    this.workflowManager.addOuterface();
  }


  save(): void {
    const experiment: LabExperiment = this.experimentState.currentExperiment;
    this.saveIsLoading = true;
    this.experimentService.updateExperimentProtocol(experiment.id, this.workflowManager.workflow).subscribe(
      newExp => this.onSaveSuccess(newExp),
      () => this.saveIsLoading = false
    );
  }


  private onSaveSuccess(experiment: LabExperiment): void {
    this.snackBarService.openSuccessMessage('biox.experiment_saved', true);
    this.saveIsLoading = false;
    this.experimentState.updateExperiment(experiment);
  }

  start(): void {
    const experiment: LabExperiment = this.experimentState.currentExperiment;

    this.startIsLoading = true;
    this.experimentService.saveAndStartExperiment(experiment.id, this.workflowManager.workflow).subscribe(
      (exp) => this.onStartSuccess(exp),
      () => this.startIsLoading = false
    );
  }

  private onStartSuccess(experiment: LabExperiment): void {
    this.snackBarService.openSuccessMessage('biox.experiment_started', true);
    this.startIsLoading = false;
    this.experimentState.updateExperiment(experiment);
    // this.workflowManager.startRefreshing();
  }

  stopExperiment(): void {
    const data: FlConfirmDialogInput = {
      title: 'biox.stop_experiment',
      content: 'biox.stop_experiment_confirmation',
      translateTitleAndContent: true,
      observable: this.experimentService.stopExperiment(this.experimentState.currentExperiment.id),
      successMessage: 'biox.experiment_stopped',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onUpdateExperimentClosed(result)
    );
  }


  private onUpdateExperimentClosed(result: FlConfirmDialogResult<LabExperiment>): void {
    if (result?.choice) {
      this.experimentState.updateExperiment(result.result);
    }
  }


}
