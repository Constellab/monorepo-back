import {Component, OnInit} from '@angular/core';
import {ProjectService} from '../../../../service/project.service';
import {RouterService} from '../../../../../core/service/router.service';
import {ProjectDatasource} from '../../../../../core/model/entities/project.class';

/**
 * Small list of project in the dashboard
 */
@Component({
  selector: 'gen-dashboard-projects',
  templateUrl: './dashboard-projects.component.html',
  styleUrls: ['./dashboard-projects.component.scss']
})
export class DashboardProjectsComponent implements OnInit {

  projectsDatasource: ProjectDatasource;

  myProjectsRoute: string = RouterService.getMyProjectsRoute();

  constructor(private projectService: ProjectService) {
  }

  ngOnInit(): void {
    this.getMyProjects();
  }

  private getMyProjects(): void {
    this.projectsDatasource = this.projectService.getDashboardMyProjectsDatasource();
  }

}
