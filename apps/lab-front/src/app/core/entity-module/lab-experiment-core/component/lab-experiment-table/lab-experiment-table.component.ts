import {Component, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';

@Component({
  selector: 'gen-lab-experiment-table',
  templateUrl: './lab-experiment-table.component.html',
  styleUrls: ['./lab-experiment-table.component.css']
})
export class LabExperimentTableComponent extends FlTableAbstractDirective<LabExperiment>
  implements OnInit {

  constructor() {
    super(['title', 'score', 'status', 'createdAt']);
  }

  ngOnInit(): void {
  }

}
