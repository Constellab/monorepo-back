import {Component, OnInit} from '@angular/core';
import {CaProjectService} from '../../../../ca-core/service-api/ca-project.service';
import {CaProject, CaProjectDatasource, CaProjectLevel} from '../../../../ca-core/model/entities/ca-project.class';
import {
  CaProjectFormDialogComponent,
  CaProjectFormDialogInput
} from '../../../../ca-core/entity-module/ca-project-core/component/ca-project-form-dialog/ca-project-form-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-my-projects-page',
  templateUrl: './ca-my-projects-page.component.html',
  styleUrls: ['./ca-my-projects-page.component.scss']
})
export class CaMyProjectsPageComponent implements OnInit {

  projectsDatasource: CaProjectDatasource;

  constructor(private projectService: CaProjectService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.projectsDatasource = this.projectService.getMyProjectsDatasource();
  }

  openCreateProjectDialog(): void {
    const dialogInput: CaProjectFormDialogInput = {
      mode: 'create',
      level: CaProjectLevel.PROJECT,
      parentId: null,
      parentLevel: null,
    };
    this.dialogService.openSmallDialog(CaProjectFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      projects => this.onCreateProjectClosed(projects)
    );
  }

  private onCreateProjectClosed(project?: CaProject): void {
    if (project) {
      // add the project at the beginning of the array
      // and refresh the array
      this.projectsDatasource.addItem(project, () => true);
    }
  }

}
