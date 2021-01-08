import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Validators} from '@angular/forms';
import {ServerInfo} from '../../../../model/entities/server-info.class';
import {ServerInfoService} from '../../../../service-api/server-info.service';
import {Observable} from 'rxjs';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Dialog to create or update a server info
 */
@Component({
  selector: 'gen-server-info-form-dialog',
  templateUrl: './server-info-form-dialog.component.html',
  styleUrls: ['./server-info-form-dialog.component.scss']
})
export class ServerInfoFormDialogComponent extends FlFormDialogAbstractDirective<ServerInfo> implements OnInit {

  formGp: FormGroup<ServerInfo>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<ServerInfo>,
              private serverInfoService: ServerInfoService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<ServerInfoFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'server_info_created', 'server_info_updated');
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<ServerInfo> {
    return new FormBuilder().group({
      id: [null],
      host: [null, Validators.required],
      name: [null, Validators.required],
      ram: [null, [Validators.required, Validators.min(0)]],
      diskSpace: [null, [Validators.required, Validators.min(0)]],
      diskType: [null, Validators.required],
      cpuCount: [null, [Validators.required, Validators.min(0)]],
      cpuType: [null, [Validators.required]],
      gpuCount: [null, [Validators.min(0)]],
      gpuType: [null],
    });
  }

  create(formValue: ServerInfo): Observable<ServerInfo> {
    return this.serverInfoService.create(formValue);
  }

  update(formValue: ServerInfo): Observable<ServerInfo> {
    return this.serverInfoService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'create_server_info' : 'update_server_info';
  }

}
