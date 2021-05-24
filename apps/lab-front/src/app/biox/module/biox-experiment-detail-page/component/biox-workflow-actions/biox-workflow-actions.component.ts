import {Component, OnInit} from '@angular/core';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {BioxExperimentService} from '../../../../../core/entity-service/biox-experiment.service';
import {BioxExperiment, ExperimentUpdate} from '../../../../../core/model/entities/biox-experiment.entity';
import {BioxProtocolGraph} from '../../../../../core/model/entities/biox-processable.entity';
import {BioxExperimentFlowFactory} from '../../../../../core/utils/biox-experiment-flow.factory';
import {FlSnackBarService, FlTranslateService} from '@monorepo/front-core-lib';
import {ClCoreJsonConvert} from '@monorepo/core-lib';
import {WorkflowActionState} from '../../state/workflow-action-state.service';

/**
 * Actions button for the workflow
 */
@Component({
  selector: 'gen-biox-workflow-actions',
  templateUrl: './biox-workflow-actions.component.html',
  styleUrls: ['./biox-workflow-actions.component.scss']
})
export class BioxWorkflowActionsComponent implements OnInit {

  saveIsLoading: boolean = false;
  startIsLoading: boolean = false;

  constructor(private workflowManager: WorkflowManagerState,
              private bioxExperimentService: BioxExperimentService,
              private snackBarService: FlSnackBarService,
              private actionState: WorkflowActionState,
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
      title: this.translateService.translate('biox.add_process_title')
    });
  }

  addInterface(): void {
    this.workflowManager.addInterface();
  }

  addOuterface(): void {
    this.workflowManager.addOuterface();
  }


  save(): void {
    const experiment: BioxExperiment = this.workflowManager.getExperiment();

    // convert the workflow to a protocol
    const graph: BioxProtocolGraph = BioxExperimentFlowFactory.convertWorkflowToProtocol(this.workflowManager.workflow);

    // build update object
    const experimentUpdate: ExperimentUpdate = {
      title: experiment.data.title,
      description: experiment.data.description,
      graph: graph
    };

    console.log(experimentUpdate);
    console.log(ClCoreJsonConvert.classToPlain(experimentUpdate));

    this.saveIsLoading = true;
    this.bioxExperimentService.update(experiment.id, experimentUpdate).subscribe(
      newExp => this.onSaveSuccess(newExp),
      () => this.saveIsLoading = false
    );
  }

  private onSaveSuccess(experiment: BioxExperiment): void {
    console.log(experiment);
    this.snackBarService.openSuccessMessage('biox.experiment_saved', true);
    this.saveIsLoading = false;
  }

  start(): void {
    const experiment: BioxExperiment = this.workflowManager.getExperiment();

    this.startIsLoading = true;
    this.bioxExperimentService.startExperiment(experiment.id).subscribe(
      result => this.onStartSuccess(result),
      () => this.startIsLoading = false
    );
  }

  private onStartSuccess(tes: BioxExperiment): void {
    console.log(tes);
    this.snackBarService.openSuccessMessage('biox.experiment_started', true);
    this.startIsLoading = false;
  }

}
