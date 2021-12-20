import {Component, OnInit} from '@angular/core';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';
import {CaProjectDatasource} from '../../../../../ca-core/model/entities/ca-project.class';

/**
 * Small list of project in the dashboard
 */
@Component({
  selector: 'ca-dashboard-projects',
  templateUrl: './ca-dashboard-projects.component.html',
  styleUrls: ['./ca-dashboard-projects.component.scss']
})
export class CaDashboardProjectsComponent implements OnInit {

  projectsDatasource: CaProjectDatasource;

  myProjectsRoute: string = CaRouterService.getMyProjectsRoute();

  constructor(private projectService: CaProjectService) {
  }

  ngOnInit(): void {
    this.getMyProjects();
  }

  private getMyProjects(): void {
    this.projectsDatasource = this.projectService.getDashboardMyProjectsDatasource();
  }

}
