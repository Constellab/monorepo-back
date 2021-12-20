import {Component, OnInit} from '@angular/core';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabExperimentService} from '../../../../../lab-core/entity-service/lab-experiment.service';
import {LabExperiment} from '../../../../../lab-core/model/entities/lab-experiment.entity';
import {FlSnackBarService, FlTranslateService} from '@monorepo/front-core-lib';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';

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

  constructor(private workflowManager: LabWorkflowManagerState,
              private experimentService: LabExperimentService,
              private snackBarService: FlSnackBarService,
              private actionState: LabWorkflowActionState,
              private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
  }

  get isLoading(): boolean {
    return this.saveIsLoading || this.startIsLoading;
  }

  addProcess(): void {
    this.actionState.newAction({
      action: 'processSelection',
      title: this.translateService.translate('biox.add_process')
    });
  }

  addInterface(): void {
    this.workflowManager.addInterface();
  }

  addOuterface(): void {
    this.workflowManager.addOuterface();
  }


  save(): void {
    const experiment: LabExperiment = this.workflowManager.getExperiment();
    this.saveIsLoading = true;
    this.experimentService.updateExperimentProtocol(experiment.id, this.workflowManager.workflow).subscribe(
      newExp => this.onSaveSuccess(newExp),
      () => this.saveIsLoading = false
    );
  }


  private onSaveSuccess(experiment: LabExperiment): void {
    console.log(experiment);
    this.snackBarService.openSuccessMessage('biox.experiment_saved', true);
    this.saveIsLoading = false;
  }

  start(): void {
    const experiment: LabExperiment = this.workflowManager.getExperiment();

    this.startIsLoading = true;
    this.experimentService.saveAndStartExperiment(experiment.id, this.workflowManager.workflow).subscribe(
      result => this.onStartSuccess(result),
      () => this.startIsLoading = false
    );
  }

  private onStartSuccess(tes: LabExperiment): void {
    console.log(tes);
    this.snackBarService.openSuccessMessage('biox.experiment_started', true);
    this.startIsLoading = false;
  }

}
