import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Validators} from '@angular/forms';
import {CaServerInfo} from '../../../../model/entities/ca-server-info.class';
import {CaServerInfoService} from '../../../../service-api/ca-server-info.service';
import {Observable} from 'rxjs';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Dialog to create or update a server info
 */
@Component({
  selector: 'ca-server-info-form-dialog',
  templateUrl: './ca-server-info-form-dialog.component.html',
  styleUrls: ['./ca-server-info-form-dialog.component.scss']
})
export class CaServerInfoFormDialogComponent extends FlFormDialogAbstractDirective<CaServerInfo> implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<CaServerInfo>,
              private serverInfoService: CaServerInfoService,
              protected snackBarService: FlSnackBarService,
              protected dialogRef: MatDialogRef<CaServerInfoFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<CaServerInfo> {
    return new FormBuilder().group({
      id: [null],
      cloudProvider: [null, Validators.required],
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

  create(formValue: CaServerInfo): Observable<CaServerInfo> {
    return this.serverInfoService.create(formValue);
  }

  update(formValue: CaServerInfo): Observable<CaServerInfo> {
    return this.serverInfoService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'create_server_info' : 'update_server_info';
  }

  getCreateSuccessMessage(): string {
    return 'server_info_created';
  }

  getUpdateSuccessMessage(): string {
    return 'server_info_updated';
  }


}
