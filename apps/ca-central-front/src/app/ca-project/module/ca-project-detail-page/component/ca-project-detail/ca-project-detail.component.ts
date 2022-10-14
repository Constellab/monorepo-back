import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  CaProject,
  CaProjectLevel,
  CaProjectStatus,
  caProjectStatusDict
} from '../../../../../ca-core/model/entities/ca-project.class';
import {
  CaProjectFormDialogComponent,
  CaProjectFormDialogInput
} from '../../../../../ca-core/entity-module/ca-project-core/component/ca-project-form-dialog/ca-project-form-dialog.component';
import {
  CaUpdateStatusFormDialogComponent,
  UpdateStatusFormDialogInput
} from '../../../../../ca-core/module/ca-status/ca-update-status-form-dialog/ca-update-status-form-dialog.component';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {
  CaStatusHistoryListDialogComponent,
  CaStatusHistoryListDialogInput
} from '../../../../../ca-core/module/ca-status/ca-status-history-list-dialog/ca-status-history-list-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';

/**
 * Show detailed information for a project , used in ProjectDetailPage
 */
@Component({
  selector: 'ca-project-detail',
  templateUrl: './ca-project-detail.component.html',
  styleUrls: ['./ca-project-detail.component.scss']
})
export class CaProjectDetailComponent implements OnInit {

  @Input() project: CaProject;

  @Output() projectUpdated: EventEmitter<CaProject> = new EventEmitter<CaProject>();

  constructor(private dialogService: FlDialogService,
              private projectService: CaProjectService) {
  }

  ngOnInit(): void {
  }

  get createChildrenText(): string {
    switch (this.project.currentLevel) {
      case CaProjectLevel.PROJECT:
        return 'new_work_package';
      case CaProjectLevel.WORK_PACKAGE:
        return 'new_task';
      default:
        return '';
    }
  }

  openUpdateProjectDialog(): void {
    const dialogInput: CaProjectFormDialogInput = {
      mode: 'update',
      object: this.project,
      level: this.project.currentLevel,
      parentId: null,
    };

    this.dialogService.openSmallDialog(CaProjectFormDialogComponent, {
      data: dialogInput
    }).afterClosed().subscribe(
      project => this.updateDialogClosed(project)
    );
  }

  openUpdateStatusDialog(): void {
    const dialogInput: UpdateStatusFormDialogInput<CaProjectStatus> = {
      statusDict: caProjectStatusDict,
      currentStatus: this.project.currentStatus.status,
      updateStatus: this.projectService.getUpdateStatusMethod(this.project.id),
      title: 'update_project_status'
    };
    this.dialogService.openSmallDialog(CaUpdateStatusFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      newExp => this.updateDialogClosed(newExp)
    );
  }

  private updateDialogClosed(project?: CaProject): void {
    if (project) {
      this.projectUpdated.next(project);
    }
  }

  openChildCreation(): void {
    const dialogInput: CaProjectFormDialogInput = {
      mode: 'create',
      level: this.project.getChildLevel(),
      parentId: this.project.id
    };

    this.dialogService.openSmallDialog(CaProjectFormDialogComponent, {
      data: dialogInput
    }).afterClosed().subscribe();
  }

  openStatusHistory(): void {
    const dialogInput: CaStatusHistoryListDialogInput = {
      statusHistoriesObs: this.projectService.getStatusHistories(this.project.id),
    };
    this.dialogService.openSmallDialog(CaStatusHistoryListDialogComponent, {data: dialogInput});
  }

}
