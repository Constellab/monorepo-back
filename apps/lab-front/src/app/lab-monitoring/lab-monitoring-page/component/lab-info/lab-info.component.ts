import {Component, OnInit} from '@angular/core';
import {LabSystemService} from '../../../../lab-core/service/lab-system.service';
import {LabSystemInfo} from '../../../../lab-core/model/global/lab-system.class';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlPortalActionsService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {LabTypeService} from '../../../../lab-core/entity-service/lab-type.service';
import {LabProjectService} from '../../../../lab-core/entity-service/lab-project.service';

@Component({
  selector: 'lab-info',
  templateUrl: './lab-info.component.html',
  styleUrls: ['./lab-info.component.scss']
})
export class LabInfoComponent implements OnInit {

  labInfo: LabSystemInfo;
  isLoading: boolean = true;

  synchronizeLoading: boolean = false;

  constructor(private systemService: LabSystemService,
              private typeService: LabTypeService,
              private dialogService: FlDialogService,
              private projectService: LabProjectService,
              private snackBarService: FlSnackBarService,
              private actionService: FlPortalActionsService) {
  }

  ngOnInit(): void {
    this.systemService.getSystemInfo().subscribe(
      {
        next: labInfo => this.onSuccess(labInfo),
        error: () => this.onError()
      }
    );
  }

  private onSuccess(labInfo: LabSystemInfo): void {
    this.labInfo = labInfo;
    this.isLoading = false;
  }

  private onError(): void {
    this.labInfo = null;
    this.isLoading = false;
  }

  deleteUnavailableTypings(): void {
    this.dialogService.openConfirmDialog({
      title: 'monitoring.delete_all_unavailable_typings',
      content: 'monitoring.delete_unavailable_typings_confirmation',
      translateTitleAndContent: true,
      observable: this.typeService.deleteUnavailableTypings(),
      successMessage: 'monitoring.delete_unavailable_typings_success',
      translateMessage: true
    });
  }

  synchronizeProjects(): void {
    if (this.synchronizeLoading) return;

    this.synchronizeLoading = true;
    this.projectService.synchronizeProjects().subscribe({
      next: () => this.synchronizeSuccess(),
      error: () => this.synchronizeLoading = false
    });
  }

  private synchronizeSuccess(): void {
    this.synchronizeLoading = false;
    this.snackBarService.openSuccessMessage({text: 'monitoring.projects_synchronized', translateText: true});
  }

  cleanLab(): void {
    const input: FlConfirmDialogInput = {
      title: 'monitoring.clean_lab',
      content: 'monitoring.clean_lab_confirmation',
      translateTitleAndContent: true,
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onCleanLabClosed(result)
    );

  }

  private onCleanLabClosed(result: FlConfirmDialogResult): void {
    if (result.choice) {
      this.actionService.addAction({
        type: 'lab-garbage-collector',
        action: this.systemService.triggerGarbageCollection(),
        text: {text: 'monitoring.clean_lab', translateText: true},
      }, true);
    }
  }
}

