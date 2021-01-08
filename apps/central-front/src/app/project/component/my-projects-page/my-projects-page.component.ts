import {Component, OnInit} from '@angular/core';
import {ProjectService} from '../../../dashboard/service/project.service';
import {Project, ProjectDatasource} from '../../../core/model/entities/project.class';
import {ProjectFormDialogComponent} from '../../../core/entity-module/project-core/component/project-form-dialog/project-form-dialog.component';
import {FlDialogService, FlFormDialogInput} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-my-projects-page',
  templateUrl: './my-projects-page.component.html',
  styleUrls: ['./my-projects-page.component.scss']
})
export class MyProjectsPageComponent implements OnInit {

  projectsDatasource: ProjectDatasource;

  constructor(private projectService: ProjectService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.projectsDatasource = this.projectService.getMyProjectsDatasource();
  }

  openCreateProjectDialog(): void {
    const dialogInput: FlFormDialogInput = {
      mode: 'create'
    };
    this.dialogService.openSmallDialog(ProjectFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      projects => this.onCreateProjectClosed(projects)
    );
  }

  private onCreateProjectClosed(project?: Project): void {
    if (project) {
      // add the project at the beginning of the array
      // and refresh the array
      this.projectsDatasource.addItem(project, () => true);
    }
  }

}
