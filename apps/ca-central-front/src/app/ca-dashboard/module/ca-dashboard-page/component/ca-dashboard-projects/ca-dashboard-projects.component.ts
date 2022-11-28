import {Component, OnInit} from '@angular/core';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';
import {CaProject, CaProjectDatasource, CaProjectLevel} from '../../../../../ca-core/model/entities/ca-project.class';
import {CaDashboardListLayoutComponent} from '../ca-dashboard-list-layout/ca-dashboard-list-layout.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaProjectFormDialogComponent,
  CaProjectFormDialogInput
} from '../../../../../ca-core/entity-module/ca-project-core/component/ca-project-form-dialog/ca-project-form-dialog.component';

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

  constructor(private projectService: CaProjectService,
              private dialogService: FlDialogService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.getMyProjects();
  }

  private getMyProjects(): void {
    this.projectsDatasource = this.projectService.getMyProjectsDatasource(CaDashboardListLayoutComponent.maxItems);
  }

  openCreateProjectDialog(): void {
    const dialogInput: CaProjectFormDialogInput = {
      mode: 'create',
      level: CaProjectLevel.PROJECT,
      parentId: null,
      parentLevel: null,
    };
    this.dialogService.openSmallDialog(CaProjectFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      projects => this.onCreateProjectDialogClosed(projects)
    );  }

  private onCreateProjectDialogClosed(project?: CaProject): void{
    if(project){
      this.routerService.navigateToProjectDetail(project.id);
    }
  }
}
