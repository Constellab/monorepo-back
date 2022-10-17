import {Component, OnInit} from '@angular/core';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {ActivatedRoute} from '@angular/router';
import {Observable, switchMap} from 'rxjs';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {map} from 'rxjs/operators';

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

  experiment$: Observable<CaExperiment[]>;
  reports$: Observable<CaReport[]>;

  showChildren$: Observable<boolean>;

  constructor(private projectService: CaProjectService,
              private reportService: CaReportService,
              private experimentService: CaExperimentService,
              private route: ActivatedRoute,
              private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.state.init(this.route.params.pipe(
      map(params => params.id)
    ));
    this.projectId$ = this.state.getProjectId$();
    this.experiment$ = this.state.getProjectId$().pipe(
      switchMap(id => this.experimentService.getExperimentsByProject(id))
    );
    this.reports$ = this.state.getProjectId$().pipe(
      switchMap(id => this.reportService.getReportsByProject(id))
    );

    this.showChildren$ = this.state.getProject$(false).pipe(
      map(project => project?.hasChildren() ?? false)
    );
  }


}
