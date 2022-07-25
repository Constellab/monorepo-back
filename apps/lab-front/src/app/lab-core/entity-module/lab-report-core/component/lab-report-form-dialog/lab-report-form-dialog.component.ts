import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {LabReport, LabReportForm} from '../../../../model/entities/lab-report.entity';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {Validators} from '@angular/forms';
import {LabReportService} from '../../../../entity-service/lab-report.service';
import {LabEntity} from '../../../../model/global/lab-entity.entity';

export interface LabReportFormDialogInput extends FlFormDialogInput<LabReportForm> {
  reportId?: string;
  experimentId?: string; // can be provided during create to associate the report directly to an experiment
  project?: LabEntity;
  disableProject?: boolean;
}

@Component({
  selector: 'lab-report-form-dialog',
  templateUrl: './lab-report-form-dialog.component.html',
  styleUrls: ['./lab-report-form-dialog.component.scss']
})
export class LabReportFormDialogComponent extends FlFormDialogAbstractDirective<LabReportForm, LabReport> implements OnInit {

  dialogInput: LabReportFormDialogInput;

  constructor(private reportService: LabReportService,
              @Inject(MAT_DIALOG_DATA) dialogInput: LabReportFormDialogInput,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<LabReportFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  get title(): string {
    return this.isCreateMode() ? 'biox.create_report' : 'biox.update_report';
  }

  buildForm(): FormGroup<LabReportForm> {
    const formGroup: FormGroup<LabReportForm> = new FormBuilder().group({
      title: [null, Validators.required],
      project: [{value: this.dialogInput.project, disabled: this.isCreateMode() && this.dialogInput.project != null}]
    });

    if(this.dialogInput.disableProject) {
      formGroup.get('project').disable();
    }

    return formGroup;
  }

  create(formValue: LabReportForm): Observable<LabReport> {
    if (this.dialogInput.experimentId) {
      return this.reportService.createForExperiment(formValue, this.dialogInput.experimentId);
    } else {
      return this.reportService.create(formValue);
    }
  }

  update(formValue: LabReportForm): Observable<LabReport> {
    return this.reportService.update(this.dialogInput.reportId, formValue);
  }

  getCreateSuccessMessage(): string {
    return 'biox.report_created';
  }

  getUpdateSuccessMessage(): string {
    return 'biox.report_updated';
  }




}
