import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {
  CaExternalLabBackup,
  CaExternalLabBackupStorage
} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';

/**
 * Show 1 backup information for a lab instance
 */
@Component({
  selector: 'ca-lab-instance-backup',
  templateUrl: './ca-lab-instance-backup.component.html',
  styleUrls: ['./ca-lab-instance-backup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaLabInstanceBackupComponent implements OnInit {

  @Input() backup: CaExternalLabBackup;

  constructor() {
  }

  ngOnInit(): void {
  }

  getDuration(backup: CaExternalLabBackupStorage): number {
    return backup.endUploadAt.diff(backup.startUploadAt).toMillis();
  }
}
