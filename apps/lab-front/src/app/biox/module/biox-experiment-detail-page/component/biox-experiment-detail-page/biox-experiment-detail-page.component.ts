import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {BioxExperiment} from '../../../../../core/model/entities/biox-experiment.entity';
import {BioxExperimentDetailPageState} from '../../state/biox-experiment-detail-page.state';

/**
 * Page for the biox experiment detail with workflow view/edit
 */
@Component({
  selector: 'gen-biox-experiment-detail-page',
  templateUrl: './biox-experiment-detail-page.component.html',
  styleUrls: ['./biox-experiment-detail-page.component.scss']
})
export class BioxExperimentDetailPageComponent implements OnInit, OnDestroy {

  experiment$: Observable<BioxExperiment>;

  constructor(private route: ActivatedRoute,
              private experimentState: BioxExperimentDetailPageState) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(experimentId: string): void {
    this.experimentState.init(experimentId);
    this.experiment$ = this.experimentState.getExperiment$();
  }

  ngOnDestroy(): void {
    this.experimentState.clear();
  }


}
