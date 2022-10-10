import {Component, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';

@Component({
  selector: 'ca-experiment-table',
  templateUrl: './ca-experiment-table.component.html',
  styleUrls: ['./ca-experiment-table.component.scss']
})
export class CaExperimentTableComponent extends FlTableAbstractDirective<CaExperiment>
  implements OnInit {

  constructor() {
    super(['title', 'lastSync', 'status', 'createdBy']);
  }

  ngOnInit(): void {
  }

  getExperimentRoute(experiment: CaExperiment): string {
    return CaRouterService.getExperimentDetailRoute(experiment.projectId, experiment.id);
  }

}
