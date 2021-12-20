import {Component, OnInit} from '@angular/core';
import {FlPaginatedTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';
import {LabRouterService} from '../../../../service/lab-router.service';

@Component({
  selector: 'lab-experiment-table',
  templateUrl: './lab-experiment-table.component.html',
  styleUrls: ['./lab-experiment-table.component.scss']
})
export class LabExperimentTableComponent extends FlPaginatedTableAbstractDirective<LabExperiment>
  implements OnInit {

  constructor() {
    super(['title', 'score', 'status', 'createdAt', 'tags']);
  }

  ngOnInit(): void {
  }

  getExperimentRoute(experiment: LabExperiment): string {
    return LabRouterService.getExperimentDetailRoute(experiment.id);
  }
}
