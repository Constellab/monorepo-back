import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {LabExperiment} from '../../../../../lab-core/model/entities/lab-experiment.entity';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {FlDialogService} from '@monorepo/front-core-lib';
import {MatDrawer} from '@angular/material/sidenav';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';

/**
 * Page for the biox experiment detail with workflow view/edit
 */
@Component({
  selector: 'lab-experiment-detail-page',
  templateUrl: './lab-experiment-detail-page.component.html',
  styleUrls: ['./lab-experiment-detail-page.component.scss']
})
export class LabExperimentDetailPageComponent implements OnInit, OnDestroy {

  @ViewChild(MatDrawer, {static: true}) drawer: MatDrawer;


  experiment$: Observable<LabExperiment>;


  constructor(private route: ActivatedRoute,
              private experimentState: LabExperimentDetailPageState,
              private dialogService: FlDialogService,
              private actionState: LabWorkflowActionState) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );

    this.actionState.init(this.drawer);
  }

  private init(experimentId: string): void {
    this.experimentState.init(experimentId);
    this.experiment$ = this.experimentState.getExperiment$();
  }


  ngOnDestroy(): void {
    this.experimentState.clear();
    this.actionState.clear();
  }


}
