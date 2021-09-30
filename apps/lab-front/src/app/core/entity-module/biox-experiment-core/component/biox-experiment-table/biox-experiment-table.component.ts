import {Component, OnInit} from '@angular/core';
import {FlPaginatedTableAbstractDirective} from '@monorepo/front-core-lib';
import {BioxExperiment} from '../../../../model/entities/biox-experiment.entity';
import {RouterService} from '../../../../service/router.service';

@Component({
  selector: 'gen-biox-experiment-table',
  templateUrl: './biox-experiment-table.component.html',
  styleUrls: ['./biox-experiment-table.component.scss']
})
export class BioxExperimentTableComponent extends FlPaginatedTableAbstractDirective<BioxExperiment>
  implements OnInit {

  constructor() {
    super(['title', 'score', 'status', 'createdAt']);
  }

  ngOnInit(): void {
  }

  getBioxExperimentRoute(experiment: BioxExperiment): string {
    return RouterService.getBioxExperimentDetailRoute(experiment.id);
  }
}
