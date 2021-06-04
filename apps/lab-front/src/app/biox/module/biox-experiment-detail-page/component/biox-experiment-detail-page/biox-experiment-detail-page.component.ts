import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {BioxExperiment} from '../../../../../core/model/entities/biox-experiment.entity';
import {BioxExperimentDetailPageState} from '../../state/biox-experiment-detail-page.state';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  BioxExperimentFormDialogComponent,
  BioxExperimentFormDialogInput
} from '../../../../../core/entity-module/biox-experiment-core/component/biox-experiment-form-dialog/biox-experiment-form-dialog.component';
import {MatDrawer} from '@angular/material/sidenav';
import {WorkflowActionState} from '../../state/workflow-action-state';

/**
 * Page for the biox experiment detail with workflow view/edit
 */
@Component({
  selector: 'gen-biox-experiment-detail-page',
  templateUrl: './biox-experiment-detail-page.component.html',
  styleUrls: ['./biox-experiment-detail-page.component.scss']
})
export class BioxExperimentDetailPageComponent implements OnInit, OnDestroy {

  @ViewChild(MatDrawer, {static: true}) drawer: MatDrawer;


  experiment$: Observable<BioxExperiment>;

  constructor(private route: ActivatedRoute,
              private experimentState: BioxExperimentDetailPageState,
              private dialogService: FlDialogService,
              private actionState: WorkflowActionState) {
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

  openUpdateDialog(): void {
    const experiment: BioxExperiment = this.experimentState.currentExperiment;
    const input: BioxExperimentFormDialogInput = {
      object: experiment.data,
      mode: 'update',
      experimentId: experiment.id
    };

    this.dialogService.openSmallDialog(BioxExperimentFormDialogComponent, {data: input})
      .afterClosed().subscribe(
      result => this.onExperimentUpdate(result)
    );
  }

  private onExperimentUpdate(experiment?: BioxExperiment): void {
    if (experiment) {
      this.experimentState.updateExperiment(experiment);
    }
  }

  ngOnDestroy(): void {
    this.experimentState.clear();
    this.actionState.clear();
  }


}
