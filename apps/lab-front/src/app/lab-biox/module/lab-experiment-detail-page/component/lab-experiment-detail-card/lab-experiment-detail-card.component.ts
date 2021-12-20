import {Component, OnInit} from '@angular/core';
import {LabExperiment, LabExperimentSimpleForm} from '../../../../../lab-core/model/entities/lab-experiment.entity';
import {
  LabExperimentFormDialogComponent,
  LabExperimentFormDialogInput
} from '../../../../../lab-core/entity-module/lab-experiment-core/component/lab-experiment-form-dialog/lab-experiment-form-dialog.component';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTagDialogService
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {
  LabProgressBarInfoDialogComponent
} from '../lab-progress-bar-info-dialog/lab-progress-bar-info-dialog.component';
import {map} from 'rxjs/operators';
import {
  LabExperimentValidationDialogComponent,
  LabExperimentValidationDialogInput
} from '../lab-experiment-validation-dialog/lab-experiment-validation-dialog.component';
import {LabExperimentService} from '../../../../../lab-core/entity-service/lab-experiment.service';
import {LabRouterService} from '../../../../../lab-core/service/lab-router.service';

/**
 * Experiment card info for the experiment detail page
 */
@Component({
  selector: 'lab-experiment-detail-card',
  templateUrl: './lab-experiment-detail-card.component.html',
  styleUrls: ['./lab-experiment-detail-card.component.scss']
})
export class LabExperimentDetailCardComponent implements OnInit {

  experiment$: Observable<LabExperiment>;

  showDetail: boolean = true;

  constructor(private experimentState: LabExperimentDetailPageState,
              private dialogService: FlDialogService,
              private experimentService: LabExperimentService,
              private tagDialogService: FlTagDialogService,
              private routerService: LabRouterService) {
  }

  ngOnInit(): void {
    this.experiment$ = this.experimentState.getExperiment$();
  }

  openUpdateDialog(): void {
    const experiment: LabExperiment = this.experimentState.currentExperiment;

    const experimentForm: LabExperimentSimpleForm = {
      title: experiment.title,
      description: experiment.description,
      project: experiment.project
    };
    const input: LabExperimentFormDialogInput = {
      object: experimentForm,
      mode: 'update',
      experimentId: experiment.id
    };

    this.dialogService.openSmallDialog(LabExperimentFormDialogComponent,
      {data: input, panelClass: 'g-dialog-allow-overflow'}).afterClosed().subscribe(
      result => this.onExperimentUpdate(result)
    );
  }

  openValidationDialog(): void {
    const experiment: LabExperiment = this.experimentState.currentExperiment;

    const input: LabExperimentValidationDialogInput = {
      experimentId: experiment.id, project: experiment.project
    };

    this.dialogService.openSmallDialog(LabExperimentValidationDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onExperimentUpdate(result)
    );
  }

  private onExperimentUpdate(experiment?: LabExperiment): void {
    if (experiment) {
      this.experimentState.updateExperiment(experiment);
    }
  }

  async openProgressInformation(): Promise<void> {
    this.dialogService.openSmallDialog(LabProgressBarInfoDialogComponent,
      {
        data:
          this.experimentState.getFlow$().pipe(
            map(flow => flow.object.progressBar)
          )
      });
  }

  toggleDetail(): void {
    this.showDetail = !this.showDetail;
  }

  get expandIcon(): string {
    return this.showDetail ? 'expand_less' : 'expand_more';
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
      result => this.onStopExperimentClosed(result)
    );
  }

  private onStopExperimentClosed(result: FlConfirmDialogResult<LabExperiment>): void {
    if (result?.choice) {
      this.experimentState.updateExperiment(result.result);
    }
  }

  openTagsFormDialog(): void {
    const experiment = this.experimentState.currentExperiment;
    this.tagDialogService.openUpdateTagDialog({
      tags: experiment.tags,
      updateMethod: (tags) => this.experimentService.saveTags(experiment.id, tags)
    }).afterClosed().subscribe(
      newTags => {
        if (newTags != null) {
          this.experimentState.updateTags(newTags);
        }
      }
    );
  }

  openDuplicateConfirmation(): void {
    const experiment = this.experimentState.currentExperiment;

    const input: FlConfirmDialogInput = {
      title: 'biox.clone_experiment',
      content: 'biox.clone_experiment_confirmation',
      translateTitleAndContent: true,
      observable: this.experimentService.cloneExperiment(experiment.id),
      successMessage: 'biox.experiment_cloned',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDuplicateClosed(result)
    );
  }

  private onDuplicateClosed(result: FlConfirmDialogResult<LabExperiment>): void {
    if (result.choice) {
      this.routerService.navigateToExperimentDetail(result.result.id);
    }
  }

}
