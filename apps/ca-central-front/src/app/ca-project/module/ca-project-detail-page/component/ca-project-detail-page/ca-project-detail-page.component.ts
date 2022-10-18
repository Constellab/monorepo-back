import {Component, OnInit} from '@angular/core';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {map} from 'rxjs/operators';
import {FlArrayObs} from '@monorepo/front-core-lib';

/**
 * Page for a project detail
 */
@Component({
  selector: 'ca-project-detail-page',
  templateUrl: './ca-project-detail-page.component.html',
  styleUrls: ['./ca-project-detail-page.component.scss'],
  providers: [CaProjectDetailState]
})
export class CaProjectDetailPageComponent implements OnInit {

  projectId$: Observable<string>;

  experiments: FlArrayObs<CaExperiment>;
  reports: FlArrayObs<CaReport>;

  showChildren$: Observable<boolean>;
  showObjects$: Observable<boolean>;

  constructor(private projectService: CaProjectService,
              private reportService: CaReportService,
              private experimentService: CaExperimentService,
              private route: ActivatedRoute,
              private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.state.init(this.route.params.pipe(
      map(params => params.projectId)
    ));
    this.projectId$ = this.state.getProjectId$();
    this.experiments = this.state.getExperiments$();
    this.reports = this.state.getReports$();

    this.showChildren$ = this.state.getProject$(false).pipe(
      map(project => project?.hasChildren() ?? false)
    );

    this.showObjects$ = this.state.getProject$(false).pipe(
      map(project => project?.isLeaf() ?? false)
    );
  }

  selectReport(report: CaReport): void {
    this.state.updateRightPanelState({type: 'report', objectId: report.id});
  }

  selectExperiment(experiment: CaExperiment): void {
    this.state.updateRightPanelState({type: 'experiment', objectId: experiment.id});
  }

}
