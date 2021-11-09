import {Component, OnInit} from '@angular/core';
import {BioxExperiment, ExperimentSimpleForm} from '../../../../../core/model/entities/biox-experiment.entity';
import {
  BioxExperimentFormDialogComponent,
  BioxExperimentFormDialogInput
} from '../../../../../core/entity-module/biox-experiment-core/component/biox-experiment-form-dialog/biox-experiment-form-dialog.component';
import {BioxExperimentDetailPageState} from '../../state/biox-experiment-detail-page.state';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService, FlTagDialogService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProgressBarInfoDialogComponent} from '../biox-progress-bar-info-dialog/biox-progress-bar-info-dialog.component';
import {map} from 'rxjs/operators';
import {
  BioxExperimentValidationDialogComponent,
  BioxExperimentValidationDialogInput
} from '../biox-experiment-validation-dialog/biox-experiment-validation-dialog.component';
import {BioxExperimentService} from '../../../../../core/entity-service/biox-experiment.service';

/**
 * Experiment card info for the experiment detail page
 */
@Component({
  selector: 'gen-biox-experiment-detail-card',
  templateUrl: './biox-experiment-detail-card.component.html',
  styleUrls: ['./biox-experiment-detail-card.component.scss']
})
export class BioxExperimentDetailCardComponent implements OnInit {

  experiment$: Observable<BioxExperiment>;

  showDetail: boolean = true;

  constructor(private experimentState: BioxExperimentDetailPageState,
              private dialogService: FlDialogService,
              private experimentService: BioxExperimentService,
              private tagDialogService: FlTagDialogService) {
  }

  ngOnInit(): void {
    this.experiment$ = this.experimentState.getExperiment$();
  }

  openUpdateDialog(): void {
    const experiment: BioxExperiment = this.experimentState.currentExperiment;

    const experimentForm: ExperimentSimpleForm = {
      title: experiment.data.title,
      description: experiment.data.description,
      study: experiment.study
    };
    const input: BioxExperimentFormDialogInput = {
      object: experimentForm,
      mode: 'update',
      experimentId: experiment.id
    };

    this.dialogService.openSmallDialog(BioxExperimentFormDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onExperimentUpdate(result)
    );
  }

  openValidationDialog(): void {
    const experiment: BioxExperiment = this.experimentState.currentExperiment;

    const input: BioxExperimentValidationDialogInput = {
      experimentId: experiment.id, study: experiment.study
    };

    this.dialogService.openSmallDialog(BioxExperimentValidationDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onExperimentUpdate(result)
    );
  }

  private onExperimentUpdate(experiment?: BioxExperiment): void {
    if (experiment) {
      this.experimentState.updateExperiment(experiment);
    }
  }

  async openProgressInformation(): Promise<void> {
    this.dialogService.openSmallDialog(BioxProgressBarInfoDialogComponent,
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

  private onStopExperimentClosed(result: FlConfirmDialogResult<BioxExperiment>): void {
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

}
