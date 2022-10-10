import {Component, Input, OnInit} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {Observable} from 'rxjs';
import {FlTableColumn} from '@monorepo/front-core-lib';

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
  experiment: CaExperiment;
  columns: FlTableColumn<CaExperiment>[] = ['title', 'createdBy', 'status', 'lastSync'];

  constructor() {
  }

  ngOnInit(): void {
  }
}
