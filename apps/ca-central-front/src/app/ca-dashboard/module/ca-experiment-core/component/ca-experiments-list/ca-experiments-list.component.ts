import {Component, Input, OnInit} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {Observable} from 'rxjs';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';

/**
 * In the project detail page, show the list of experiments
 */
@Component({
  selector: 'ca-experiments-list',
  templateUrl: './ca-experiments-list.component.html',
  styleUrls: ['./ca-experiments-list.component.scss']
})
export class CaExperimentsListComponent implements OnInit {

  @Input() experiments$: Observable<CaExperiment[]>;

  constructor() {
  }

  ngOnInit(): void {
  }

  getExperimentRoute(experiment: CaExperiment): string {
    return CaRouterService.getExperimentDetailRoute(experiment.projectId, experiment.id);
  }
}
