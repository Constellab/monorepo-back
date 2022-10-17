import {Component, OnInit} from '@angular/core';
import {filter, Observable, switchMap} from 'rxjs';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';

/**
 * Preview of the experiment in the project detail page right section
 */
@Component({
  selector: 'ca-project-experiment-preview',
  templateUrl: './ca-project-experiment-preview.component.html',
  styleUrls: ['./ca-project-experiment-preview.component.scss']
})
export class CaProjectExperimentPreviewComponent implements OnInit {

  experiment$: Observable<CaExperiment>;

  constructor(private state: CaProjectDetailState,
              private experimentService: CaExperimentService) {
  }

  ngOnInit(): void {
    this.experiment$ = this.state.getRightPanelState$().pipe(
      filter(state => state.type === 'experiment'),
      switchMap(state => this.experimentService.findById(state.objectId))
    );

  }

}
