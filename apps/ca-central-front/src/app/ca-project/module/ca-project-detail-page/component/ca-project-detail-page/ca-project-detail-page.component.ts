import {Component, OnInit} from '@angular/core';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {ActivatedRoute} from '@angular/router';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';
import {Observable} from 'rxjs';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {map} from 'rxjs/operators';

/**
 * Page for a project detail
 */
@Component({
  selector: 'ca-project-detail-page',
  templateUrl: './ca-project-detail-page.component.html',
  styleUrls: ['./ca-project-detail-page.component.scss']
})
export class CaProjectDetailPageComponent implements OnInit {

  projectId$: Observable<string>;
  project: CaProject;

  experiment$: Observable<CaExperiment[]>;
  reports$: Observable<CaReport[]>;

  isLoading: boolean = false;

  constructor(private projectService: CaProjectService,
              private reportService: CaReportService,
              private experimentService: CaExperimentService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.projectId$ = this.route.params.pipe(
      map(params => params.id)
    );
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(id: string): void {
    this.getProject(id);
    this.experiment$ = this.experimentService.getExperimentsByProject(id);
    this.reports$ = this.reportService.getReportsByProject(id);
  }

  private getProject(id: string): void {
    this.isLoading = true;
    this.projectService.getById(id).subscribe(
      project => this.getProjectSuccess(project),
      () => this.isLoading = false
    );
  }

  private getProjectSuccess(project: CaProject): void {
    this.project = project;
    this.isLoading = false;
  }

  onProjectUpdate(project: CaProject): void {
    this.project = project;
  }

}
