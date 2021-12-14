import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Project, ProjectStatus, projectStatusDict} from '../../../../../core/model/entities/project.class';
import {
  ProjectFormDialogComponent
} from '../../../../../core/entity-module/project-core/component/project-form-dialog/project-form-dialog.component';
import {
  UpdateStatusFormDialogComponent,
  UpdateStatusFormDialogInput
} from '../../../../../core/module/status/update-status-form-dialog/update-status-form-dialog.component';
import {ProjectService} from '../../../../service/project.service';
import {
  StatusHistoryListDialogComponent,
  StatusHistoryListDialogInput
} from '../../../../../core/module/status/status-history-list-dialog/status-history-list-dialog.component';
import {FlDialogService, FlFormDialogInput} from '@monorepo/front-core-lib';

/**
 * Show detailed information for a project , used in ProjectDetailPage
 */
@Component({
  selector: 'gen-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {

  @Input() project: Project;

  @Output() projectUpdated: EventEmitter<Project> = new EventEmitter<Project>();

  constructor(private dialogService: FlDialogService,
              private projectService: ProjectService) {
  }

  ngOnInit(): void {
  }

  openUpdateProjectDialog(): void {
    const dialogInput: FlFormDialogInput<Project> = {
      mode: 'update',
      object: this.project
    };

    this.dialogService.openSmallDialog(ProjectFormDialogComponent, {
      data: dialogInput
    }).afterClosed().subscribe(
      project => this.updateDialogClosed(project)
    );
  }

  openUpdateStatusDialog(): void {
    const dialogInput: UpdateStatusFormDialogInput<ProjectStatus> = {
      statusDict: projectStatusDict,
      currentStatus: this.project.currentStatus.status,
      updateStatus: this.projectService.getUpdateStatusMethod(this.project.id),
      title: 'update_project_status'
    };
    this.dialogService.openSmallDialog(UpdateStatusFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      newExp => this.updateDialogClosed(newExp)
    );
  }

  private updateDialogClosed(project?: Project): void {
    if (project) {
      this.projectUpdated.next(project);
    }
  }

  openStatusHistory(): void {
    const dialogInput: StatusHistoryListDialogInput = {
      statusHistoriesObs: this.projectService.getStatusHistories(this.project.id),
    };
    this.dialogService.openSmallDialog(StatusHistoryListDialogComponent, {data: dialogInput});
  }

}
