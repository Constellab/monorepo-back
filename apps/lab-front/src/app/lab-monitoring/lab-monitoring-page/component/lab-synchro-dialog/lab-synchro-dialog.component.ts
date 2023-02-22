import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {FlPortalActionsService} from '@monorepo/front-core-lib';
import {LabSystemService} from '../../../../lab-core/service/lab-system.service';
import {MatDialogRef} from '@angular/material/dialog';

interface LabSynchroForm {
  syncUsers: boolean;
  syncProjects: boolean;
}

/**
 * Dialog to choose open to synchronize lab
 */
@Component({
  selector: 'lab-synchro-dialog',
  templateUrl: './lab-synchro-dialog.component.html',
  styleUrls: ['./lab-synchro-dialog.component.scss']
})
export class LabSynchroDialogComponent implements OnInit {

  formGp: FormGroup<LabSynchroForm>;

  constructor(private actionService: FlPortalActionsService,
              private systemService: LabSystemService,
              private dialogRef: MatDialogRef<LabSynchroDialogComponent>) {
  }

  ngOnInit(): void {
    this.initFormGp();
  }

  private initFormGp(): void {
    this.formGp = new FormBuilder().group<LabSynchroForm>({
      syncUsers: true,
      syncProjects: true
    });
  }

  submit(): void {
    const obs = this.systemService.synchronize(this.formGp.value.syncUsers, this.formGp.value.syncProjects);

    this.actionService.addAction({
      action: obs,
      type: 'system-synchronize',
      text: {text: 'monitoring.synchronizing_lab', translateText: true}
    });
    this.dialogRef.close();
  }

}
