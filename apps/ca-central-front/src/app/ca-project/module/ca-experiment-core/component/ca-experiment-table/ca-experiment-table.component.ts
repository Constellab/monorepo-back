import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaExperiment} from '../../../../../ca-core/model/entities/project/ca-experiment.class';

@Component({
  selector: 'ca-experiment-table',
  templateUrl: './ca-experiment-table.component.html',
  styleUrls: ['./ca-experiment-table.component.scss']
})
export class CaExperimentTableComponent extends FlTableAbstractDirective<CaExperiment>
  implements OnInit {

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() experimentSelected: EventEmitter<CaExperiment> = new EventEmitter();

  constructor() {
    super(['title', 'lastSync', 'status', 'createdBy']);
  }

  ngOnInit(): void {
  }

  rowClicked(experiment: CaExperiment): void {
    if (this.rowSelectable) {
      this.experimentSelected.next(experiment);
    }
  }

}
