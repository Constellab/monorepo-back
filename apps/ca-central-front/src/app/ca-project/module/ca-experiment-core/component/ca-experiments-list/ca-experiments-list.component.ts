import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/project/ca-experiment.class';
import {FlArrayObs, FlTableColumn} from '@monorepo/front-core-lib';

/**
 * In the project detail page, show the list of experiments
 */
@Component({
  selector: 'ca-experiments-list',
  templateUrl: './ca-experiments-list.component.html',
  styleUrls: ['./ca-experiments-list.component.scss']
})
export class CaExperimentsListComponent implements OnInit {

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() experimentSelected: EventEmitter<CaExperiment> = new EventEmitter();

  @Input() experiments: FlArrayObs<CaExperiment>;

  @Input() mode: 'small' | 'large' = 'large';

  columns: FlTableColumn<CaExperiment>[] = ['title', 'createdBy', 'status'];

  constructor() {
  }

  ngOnInit(): void {
    this.columns = this.mode === 'small' ? ['title', 'status'] : ['title', 'createdBy', 'status', 'lastSync'];
  }

  selectExperiment(experiment: CaExperiment): void {
    if (this.rowSelectable) {
      this.experimentSelected.next(experiment);
    }
  }
}
