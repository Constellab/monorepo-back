import {Component, OnInit} from '@angular/core';
import {FlPaginatedTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';
import {RouterService} from '../../../../service/router.service';

@Component({
  selector: 'gen-lab-experiment-table',
  templateUrl: './lab-experiment-table.component.html',
  styleUrls: ['./lab-experiment-table.component.css']
})
export class LabExperimentTableComponent extends FlPaginatedTableAbstractDirective<LabExperiment>
  implements OnInit {

  constructor() {
    super(['title', 'score', 'status', 'createdAt']);
  }

  ngOnInit(): void {
  }

  getLabExperimentRoute(experiment: LabExperiment): string {
    return RouterService.getLabExperimentDetailRoute(experiment.id);
  }
}
