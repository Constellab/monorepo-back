import {Component, Input, OnInit} from '@angular/core';
import {Experiment} from '../../../../../core/model/entities/experiment.class';
import {ExperimentService} from '../../../../service/experiment.service';
import {Observable} from 'rxjs';

/**
 * In the project detail page, show the list of experiments
 */
@Component({
  selector: 'gen-experiments-list',
  templateUrl: './experiments-list.component.html',
  styleUrls: ['./experiments-list.component.scss']
})
export class ExperimentsListComponent implements OnInit {

  @Input() projectId: string;

  experiments$: Observable<Experiment[]>;

  constructor(private experimentService: ExperimentService) {
  }

  ngOnInit(): void {
    this.experiments$ = this.experimentService.getExperimentsOfProject(this.projectId);
  }
}
