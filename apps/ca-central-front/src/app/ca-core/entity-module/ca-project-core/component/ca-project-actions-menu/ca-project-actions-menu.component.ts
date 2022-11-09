import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaProject, CaProjectStatus, caProjectStatusDict} from '../../../../model/entities/ca-project.class';
import {
  CaProjectFormDialogComponent,
  CaProjectFormDialogInput
} from '../ca-project-form-dialog/ca-project-form-dialog.component';
import {
  CaUpdateStatusFormDialogComponent,
  UpdateStatusFormDialogInput
} from '../../../../module/ca-status/ca-update-status-form-dialog/ca-update-status-form-dialog.component';
import {
  CaStatusHistoryListDialogComponent,
  CaStatusHistoryListDialogInput
} from '../../../../module/ca-status/ca-status-history-list-dialog/ca-status-history-list-dialog.component';
import {
  CaUpdateProjectLeaderDialogComponent,
  CaUpdateProjectLeaderDialogInput
} from '../ca-update-project-leader-dialog/ca-update-project-leader-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {CaProjectService} from '../../../../service-api/ca-project.service';
import {Observable} from 'rxjs';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Action menu button to edit or a project
 */
@Component({
  selector: 'ca-project-actions-menu',
  templateUrl: './ca-project-actions-menu.component.html',
  styleUrls: ['./ca-project-actions-menu.component.scss']
})
export class CaProjectActionsMenuComponent implements OnInit {

  @Input() project: CaProject;

  /**
   * Optional, provide the list of users of the project to avoid a call to the server
   */
  @Input() projectUsers$?: Observable<CaUser[]>;

  @Input() stopClickEvent: boolean = false;

  @Output() projectUpdated: EventEmitter<CaProject> = new EventEmitter();

  @Output() childProjectCreated: EventEmitter<CaProject> = new EventEmitter();


  constructor(private dialogService: FlDialogService,
              private projectService: CaProjectService) {
  }

  ngOnInit(): void {
  }

  stopEvent(event: MouseEvent): void {
    if (this.stopClickEvent) {
      ClHelpService.stopEventPropagation(event);
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
      this.projectUpdated.emit(project);
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
    }).afterClosed().subscribe(
      project => this.createChildSuccess(project)
    );
  }

  private createChildSuccess(project: CaProject): void {
    if (project) {
      this.childProjectCreated.emit(project);
    }
  }

  openStatusHistory(project: CaProject): void {
    const dialogInput: CaStatusHistoryListDialogInput = {
      statusHistoriesObs: this.projectService.getStatusHistories(project.id),
    };
    this.dialogService.openSmallDialog(CaStatusHistoryListDialogComponent, {data: dialogInput});
  }

  openUpdateProjectLeaderDialog(): void {
    const dialogInput: CaUpdateProjectLeaderDialogInput = {
      projectId: this.project.id,
      currentLeader: this.project.leader,
      users$: this.projectUsers$ ?? this.projectService.getUsersOfProject(this.project.id)
    };

    this.dialogService.openSmallDialog(CaUpdateProjectLeaderDialogComponent, {
      data: dialogInput
    }).afterClosed().subscribe(
      leader => this.project.leader = leader
    );
  }

}
