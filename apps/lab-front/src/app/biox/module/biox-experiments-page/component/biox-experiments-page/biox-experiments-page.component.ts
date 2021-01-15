import {Component, OnInit} from '@angular/core';
import {LabExperimentService} from '../../../../../core/entity-service/lab-experiment.service';
import {FlTableColumn} from '@monorepo/front-core-lib';
import {LabExperiment, LabExperimentDatasource} from '../../../../../core/model/entities/lab-experiment.entity';

@Component({
  selector: 'gen-biox-experiments-page',
  templateUrl: './biox-experiments-page.component.html',
  styleUrls: ['./biox-experiments-page.component.scss']
})
export class BioxExperimentsPageComponent implements OnInit {

  labExperiments: LabExperimentDatasource;

  displayedColumns: FlTableColumn<LabExperiment>[] = ['title', 'score', 'status', 'createdAt',];

  constructor(private labExperimentService: LabExperimentService) {
  }

  ngOnInit(): void {
    this.labExperiments = this.labExperimentService.getExperimentsDatasource();
  }


}
