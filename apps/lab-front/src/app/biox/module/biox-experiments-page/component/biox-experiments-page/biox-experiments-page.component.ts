import {Component, OnInit} from '@angular/core';
import {BioxExperimentService} from '../../../../../core/entity-service/biox-experiment.service';
import {FlTableColumn} from '@monorepo/front-core-lib';
import {BioxExperiment, BioxExperimentDatasource} from '../../../../../core/model/entities/biox-experiment.entity';

@Component({
  selector: 'gen-biox-experiments-page',
  templateUrl: './biox-experiments-page.component.html',
  styleUrls: ['./biox-experiments-page.component.scss']
})
export class BioxExperimentsPageComponent implements OnInit {

  labExperiments: BioxExperimentDatasource;

  displayedColumns: FlTableColumn<BioxExperiment>[] = ['title', 'score', 'status', 'createdAt',];

  constructor(private bioxExperimentService: BioxExperimentService) {
  }

  ngOnInit(): void {
    this.labExperiments = this.bioxExperimentService.getExperimentsDatasource();
  }


}
