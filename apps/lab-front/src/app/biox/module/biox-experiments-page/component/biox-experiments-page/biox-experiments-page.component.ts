import {Component, OnInit} from '@angular/core';
import {FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';
import {BioxExperiment, BioxExperimentDatasource} from '../../../../../core/model/entities/biox-experiment.entity';
import {BioxExperimentFormDialogComponent} from '../../../../../core/entity-module/biox-experiment-core/component/biox-experiment-form-dialog/biox-experiment-form-dialog.component';
import {BioxExperimentService} from '../../../../../core/entity-service/biox-experiment.service';

@Component({
  selector: 'gen-biox-experiments-page',
  templateUrl: './biox-experiments-page.component.html',
  styleUrls: ['./biox-experiments-page.component.scss']
})
export class BioxExperimentsPageComponent implements OnInit {

  bioxExperiments: BioxExperimentDatasource;

  displayedColumns: FlTableColumn<BioxExperiment>[] = ['title', 'description', 'status', 'createdAt'];

  constructor(private bioxExperimentService: BioxExperimentService,
              private dialogService: FlDialogService) {
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
  private onCreateExperimentClosed(experiment?: BioxExperiment): void {
    if (experiment) {
      console.log('todo');
    }
  }
}
