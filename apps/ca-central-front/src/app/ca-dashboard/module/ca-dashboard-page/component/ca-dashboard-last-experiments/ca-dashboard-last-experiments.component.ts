import {Component, OnInit} from '@angular/core';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';

@Component({
  selector: 'ca-dashboard-last-experiments',
  templateUrl: './ca-dashboard-last-experiments.component.html',
  styleUrls: ['./ca-dashboard-last-experiments.component.scss']
})
export class CaDashboardLastExperimentsComponent implements OnInit {

  lastExperiments: CaExperiment[];

  constructor(
    private experimentService: CaExperimentService) {
  }

  ngOnInit(): void {
    this.experimentService.findCurrentUserLastExperiments().subscribe(
      (res: CaExperiment[]) => this.lastExperiments = res
    );
  }

}
