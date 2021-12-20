import {Component, Input, OnInit} from '@angular/core';
import {Experiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {Observable} from 'rxjs';

/**
 * In the project detail page, show the list of experiments
 */
@Component({
  selector: 'ca-experiments-list',
  templateUrl: './ca-experiments-list.component.html',
  styleUrls: ['./ca-experiments-list.component.scss']
})
export class CaExperimentsListComponent implements OnInit {

  @Input() projectId: string;

  experiments$: Observable<Experiment[]>;

  constructor(private experimentService: CaExperimentService) {
  }

  ngOnInit(): void {
    this.experiments$ = this.experimentService.getExperimentsOfProject(this.projectId);
  }
}
