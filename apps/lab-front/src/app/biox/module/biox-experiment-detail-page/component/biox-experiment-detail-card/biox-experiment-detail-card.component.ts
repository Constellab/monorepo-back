import {Component, OnInit} from '@angular/core';
import {BioxExperiment, ExperimentSimpleForm} from '../../../../../core/model/entities/biox-experiment.entity';
import {
  BioxExperimentFormDialogComponent,
  BioxExperimentFormDialogInput
} from '../../../../../core/entity-module/biox-experiment-core/component/biox-experiment-form-dialog/biox-experiment-form-dialog.component';
import {BioxExperimentDetailPageState} from '../../state/biox-experiment-detail-page.state';
import {FlDialogService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProgressBarInfoDialogComponent} from '../biox-progress-bar-info-dialog/biox-progress-bar-info-dialog.component';
import {map} from 'rxjs/operators';
import {
  BioxExperimentValidationDialogComponent,
  BioxExperimentValidationDialogInput
} from '../biox-experiment-validation-dialog/biox-experiment-validation-dialog.component';

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
              private dialogService: FlDialogService) {
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

    this.dialogService.openSmallDialog(BioxExperimentFormDialogComponent, {data: input})
      .afterClosed().subscribe(
      result => this.onExperimentUpdate(result)
    );
  }

  openValidationDialog(): void {
    const experiment: BioxExperiment = this.experimentState.currentExperiment;

    const input: BioxExperimentValidationDialogInput = {
      experimentId: experiment.id, study: experiment.study
    };

    this.dialogService.openSmallDialog(BioxExperimentValidationDialogComponent, {data: input})
      .afterClosed().subscribe(
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

}
