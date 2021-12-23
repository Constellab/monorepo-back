import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LabExperiment} from '../../../../../lab-core/model/entities/lab-experiment.entity';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {FlQuillJson} from '@monorepo/front-core-lib';
import {LabExperimentService} from '../../../../../lab-core/entity-service/lab-experiment.service';

/**
 * Component inside LabExperimentDetailPage to show experiment information but not workflow
 */
@Component({
  selector: 'lab-experiment-detail',
  templateUrl: './lab-experiment-detail.component.html',
  styleUrls: ['./lab-experiment-detail.component.scss']
})
export class LabExperimentDetailComponent implements OnInit {

  experiment$: Observable<LabExperiment>;
  description: FlQuillJson;

  saveDescriptionIsLoading: boolean = false;

  constructor(private experimentState: LabExperimentDetailPageState,
              private experimentService: LabExperimentService) {
  }

  ngOnInit(): void {
    this.experiment$ = this.experimentState.getExperiment$();
    this.experimentState.getDescription$().subscribe(
      description => this.description = description
    );
  }

  saveDescription(): void {
    if (this.saveDescriptionIsLoading) return;
    this.saveDescriptionIsLoading = true;
    this.experimentService.updateDescription(this.experimentState.currentExperiment.id, this.description).subscribe(
      () => this.saveDescriptionSuccess(this.description),
      () => this.saveDescriptionIsLoading = false
    );
  }

  private saveDescriptionSuccess(description: FlQuillJson): void {
    this.saveDescriptionIsLoading = false;
    this.experimentState.updateDescription(description);
  }

}
