import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaProject, CaProjectStatus, caProjectStatusDict} from '../../../../../ca-core/model/entities/ca-project.class';
import {
  DaProjectFormDialogComponent
} from '../../../../../ca-core/entity-module/ca-project-core/component/ca-project-form-dialog/da-project-form-dialog.component';
import {
  CaUpdateStatusFormDialogComponent,
  UpdateStatusFormDialogInput
} from '../../../../../ca-core/module/ca-status/ca-update-status-form-dialog/ca-update-status-form-dialog.component';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {
  CaStatusHistoryListDialogComponent,
  StatusHistoryListDialogInput
} from '../../../../../ca-core/module/ca-status/ca-status-history-list-dialog/ca-status-history-list-dialog.component';
import {FlDialogService, FlFormDialogInput} from '@monorepo/front-core-lib';

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

  openUpdateProjectDialog(): void {
    const dialogInput: FlFormDialogInput<CaProject> = {
      mode: 'update',
      object: this.project
    };

    this.dialogService.openSmallDialog(DaProjectFormDialogComponent, {
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

  openStatusHistory(): void {
    const dialogInput: StatusHistoryListDialogInput = {
      statusHistoriesObs: this.projectService.getStatusHistories(this.project.id),
    };
    this.dialogService.openSmallDialog(CaStatusHistoryListDialogComponent, {data: dialogInput});
  }

}
