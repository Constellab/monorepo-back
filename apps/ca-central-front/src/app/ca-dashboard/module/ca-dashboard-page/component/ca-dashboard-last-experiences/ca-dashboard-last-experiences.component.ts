import { Component, OnInit } from '@angular/core';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';

@Component({
  selector: 'ca-dashboard-last-experiences',
  templateUrl: './ca-dashboard-last-experiences.component.html',
  styleUrls: ['./ca-dashboard-last-experiences.component.scss']
})
export class CaDashboardLastExperiencesComponent implements OnInit {

  lastExperiments: CaExperiment[];

  constructor(
    private experimentService: CaExperimentService
  ) { }

  ngOnInit(): void {
    this.experimentService.findCurrentUserLastExperiments().subscribe((res: CaExperiment[]) => this.lastExperiments = res);
  }

  getExperimentDetailRoute(projectId: string, experimentId: string): string{
    return CaRouterService.getExperimentDetailRoute(projectId, experimentId);
  }



}
