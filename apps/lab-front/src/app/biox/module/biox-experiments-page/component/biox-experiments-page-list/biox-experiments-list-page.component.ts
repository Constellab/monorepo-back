import {Component, OnInit} from '@angular/core';
import {FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';
import {BioxExperiment, BioxExperimentDatasource} from '../../../../../core/model/entities/biox-experiment.entity';
import {BioxExperimentFormDialogComponent} from '../../../../../core/entity-module/biox-experiment-core/component/biox-experiment-form-dialog/biox-experiment-form-dialog.component';
import {BioxExperimentService} from '../../../../../core/entity-service/biox-experiment.service';
import {RouterService} from '../../../../../core/service/router.service';
import {ViewModel} from '../../../../../core/model/global/view-model.entity';

@Component({
  selector: 'gen-biox-experiments-page-list',
  templateUrl: './biox-experiments-list-page.component.html',
  styleUrls: ['./biox-experiments-list-page.component.scss']
})
export class BioxExperimentsListPageComponent implements OnInit {

  bioxExperiments: BioxExperimentDatasource;

  displayedColumns: FlTableColumn<BioxExperiment>[] = ['title', 'description', 'status', 'createdAt'];

  constructor(private bioxExperimentService: BioxExperimentService,
              private dialogService: FlDialogService,
              private routerService: RouterService) {
  }

  ngOnInit(): void {
    this.bioxExperiments = this.bioxExperimentService.getExperimentsDatasource();
  }

  createExperiment(): void {
    const input: FlFormDialogInput<BioxExperiment> = {mode: 'create'};
    this.dialogService.openSmallDialog(BioxExperimentFormDialogComponent, {data: input})
      .afterClosed().subscribe(
      experiment => this.onCreateExperimentClosed(experiment)
    );
  }

  // todo
  private onCreateExperimentClosed(experiment?: ViewModel<BioxExperiment>): void {
    if (experiment) {
      this.routerService.navigateToBioxExperimentDetail(experiment.model.id);
    }
  }
}
