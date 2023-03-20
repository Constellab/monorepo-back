import {Component, Inject, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {Observable} from 'rxjs';
import {CaExternalLabBackupHistory} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {map} from 'rxjs/operators';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'ca-lab-backup-history-dialog',
  templateUrl: './ca-lab-backup-history-dialog.component.html',
  styleUrls: ['./ca-lab-backup-history-dialog.component.scss']
})
export class CaLabBackupHistoryDialogComponent implements OnInit {

  backupHistory$: Observable<CaExternalLabBackupHistory> = this.labService.getBackupHistory(this.labInstanceId).pipe(
    map(history => {
      //  from most recent to oldest
      history.backups = history.backups.reverse();
      return history;
    })
  );

  constructor(@Inject(MAT_DIALOG_DATA) private labInstanceId: string,
              private labService: CaLabInstanceService) {
  }

  ngOnInit(): void {
  }

}
