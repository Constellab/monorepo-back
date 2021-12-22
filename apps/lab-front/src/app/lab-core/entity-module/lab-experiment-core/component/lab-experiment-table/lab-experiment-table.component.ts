import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlPaginatedTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';
import {ClHelpService} from '@monorepo/core-lib';

@Component({
  selector: 'lab-experiment-table',
  templateUrl: './lab-experiment-table.component.html',
  styleUrls: ['./lab-experiment-table.component.scss']
})
export class LabExperimentTableComponent extends FlPaginatedTableAbstractDirective<LabExperiment>
  implements OnInit {

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() experimentSelected: EventEmitter<LabExperiment> = new EventEmitter();


  constructor() {
    super(['score', 'status', 'createdAt', 'tags']);
  }

  ngOnInit(): void {
  }

  rowClicked(experiment: LabExperiment): void {
    if (this.rowSelectable) {
      this.experimentSelected.next(experiment);
    }
  }

  test(event: MouseEvent): void {
    event.stopImmediatePropagation();
    ClHelpService.stopEventPropagation(event);
  }
}
