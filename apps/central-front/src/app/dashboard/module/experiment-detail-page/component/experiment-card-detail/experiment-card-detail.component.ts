import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Experiment} from '../../../../../core/model/entities/experiment.class';
import {
  ExperimentFormDialogComponent
} from '../../../experiment-core/component/experiment-form-dialog/experiment-form-dialog.component';
import {LabIframeOptions, RouterService} from '../../../../../core/service/router.service';
import {FlDialogService, FlFormDialogInput} from '@monorepo/front-core-lib';

/**
 * Detail card of the experiment used in the experiment page
 */
@Component({
  selector: 'gen-experiment-card-detail',
  templateUrl: './experiment-card-detail.component.html',
  styleUrls: ['./experiment-card-detail.component.scss']
})
export class ExperimentCardDetailComponent implements OnInit {

  @Input() experiment: Experiment;
  @Output() update: EventEmitter<Experiment> = new EventEmitter<Experiment>();

  openInLabLink: string;
  linkQueryParams: LabIframeOptions;

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    if (this.experiment.labInstance.isRunning()) {
      this.openInLabLink = RouterService.getLabIframeRoute(this.experiment.labInstance.id);
      this.linkQueryParams = {objectType: 'experiment', objectId: this.experiment.id};
    }
  }


  openUpdateExperimentDialog(): void {
    const dialogInput: FlFormDialogInput<Experiment> = {
      mode: 'update',
      object: this.experiment,
    };
    this.dialogService.openSmallDialog(ExperimentFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      newExp => this.onUpdateDialogClosed(newExp)
    );
  }

  private onUpdateDialogClosed(experiment: Experiment): void {
    if (experiment) {
      this.update.emit(experiment);
    }
  }
}
