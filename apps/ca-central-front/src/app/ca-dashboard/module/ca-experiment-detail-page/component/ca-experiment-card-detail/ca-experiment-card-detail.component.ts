import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Experiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {
  CaExperimentFormDialogComponent
} from '../../../ca-experiment-core/component/ca-experiment-form-dialog/ca-experiment-form-dialog.component';
import {CaLabIframeOptions, CaRouterService} from '../../../../../ca-core/service/ca-router.service';
import {FlDialogService, FlFormDialogInput} from '@monorepo/front-core-lib';

/**
 * Detail card of the experiment used in the experiment page
 */
@Component({
  selector: 'ca-experiment-card-detail',
  templateUrl: './ca-experiment-card-detail.component.html',
  styleUrls: ['./ca-experiment-card-detail.component.scss']
})
export class CaExperimentCardDetailComponent implements OnInit {

  @Input() experiment: Experiment;
  @Output() update: EventEmitter<Experiment> = new EventEmitter<Experiment>();

  openInLabLink: string;
  linkQueryParams: CaLabIframeOptions;

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    if (this.experiment.labInstance.isRunning()) {
      this.openInLabLink = CaRouterService.getLabIframeRoute(this.experiment.labInstance.id);
      this.linkQueryParams = {objectType: 'experiment', objectId: this.experiment.id};
    }
  }


  openUpdateExperimentDialog(): void {
    const dialogInput: FlFormDialogInput<Experiment> = {
      mode: 'update',
      object: this.experiment,
    };
    this.dialogService.openSmallDialog(CaExperimentFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      newExp => this.onUpdateDialogClosed(newExp)
    );
  }

  private onUpdateDialogClosed(experiment: Experiment): void {
    if (experiment) {
      this.update.emit(experiment);
    }
  }
}
