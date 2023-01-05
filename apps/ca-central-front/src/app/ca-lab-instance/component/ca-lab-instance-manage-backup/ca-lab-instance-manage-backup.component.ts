import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlPortalActionsService
} from '@monorepo/front-core-lib';
import {
  CaExternalLabBackup,
  CaExternalLabBackupStorage
} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {Observable} from 'rxjs';
import {
  CaLabBackupHistoryDialogComponent
} from '../ca-lab-backup-history-dialog/ca-lab-backup-history-dialog.component';

/**
 * Component to manage the backup of a lab instance
 * Possibility to start a backup, stop the current backup and see history
 */
@Component({
  selector: 'ca-lab-instance-manage-backup',
  templateUrl: './ca-lab-instance-manage-backup.component.html',
  styleUrls: ['./ca-lab-instance-manage-backup.component.scss']
})
export class CaLabInstanceManageBackupComponent implements OnInit {

  @Input() labInstanceId: string;

  currentStatus$: Observable<CaExternalLabBackup>;

  constructor(private labInstanceService: CaLabInstanceService,
              private actionService: FlPortalActionsService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.refreshCurrentStatus();
  }

  refreshCurrentStatus(): void {
    this.currentStatus$ = this.labInstanceService.getBackupCurrentStatus(this.labInstanceId);
  }


  backupProd(): void {
    const input: FlConfirmDialogInput = {
      title: 'backup_lab_production',
      content: 'backup_lab_production_confirmation',
      translateTitleAndContent: true,
      observable: this.labInstanceService.backupProd(this.labInstanceId),
      successMessage: 'backup_lab_production_started',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onBackupProdClosed(result)
    );
  }

  private onBackupProdClosed(result: FlConfirmDialogResult<CaExternalLabBackupStorage>): void {
    if (result.choice) {
      this.refreshCurrentStatus();
    }
  }

  stopCurrentBackup(): void {
    const input: FlConfirmDialogInput = {
      title: 'stop_lab_current_backup',
      content: 'stop_lab_current_backup_confirmation',
      translateTitleAndContent: true,
      observable: this.labInstanceService.stopCurrentBackup(this.labInstanceId),
      successMessage: 'lab_current_backup_stopped',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onStopCurrentBackupClosed(result)
    );
  }

  private onStopCurrentBackupClosed(result: FlConfirmDialogResult<boolean>): void {
    if (result.choice) {
      this.refreshCurrentStatus();
    }
  }

  showBackupHistory(): void {
    this.dialogService.openMediumDialog(CaLabBackupHistoryDialogComponent, {data: this.labInstanceId});
  }

}
