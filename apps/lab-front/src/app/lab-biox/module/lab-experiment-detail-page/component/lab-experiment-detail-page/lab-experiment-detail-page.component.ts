import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {LabExperiment} from '../../../../../lab-core/model/entities/lab-experiment.entity';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {FlDialogService} from '@monorepo/front-core-lib';
import {MatDrawer} from '@angular/material/sidenav';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {first} from 'rxjs/operators';

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

  selectedTabIndex: number = 0;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private experimentState: LabExperimentDetailPageState,
              private dialogService: FlDialogService,
              private actionState: LabWorkflowActionState) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );

    // init the tab base on query param
    this.route.queryParams.pipe(first()).subscribe(
      queryParams => this.selectedTabIndex = queryParams.tab ?? 0
    );

    this.actionState.init(this.drawer);
  }

  private init(experimentId: string): void {
    this.experimentState.init(experimentId);
    this.experiment$ = this.experimentState.getExperiment$();
  }

  // on tab change, update the query param
  tabIndexChange(index: number): void {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {tab: index},
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
  }


  ngOnDestroy(): void {
    this.experimentState.clear();
    this.actionState.clear();
  }


}
