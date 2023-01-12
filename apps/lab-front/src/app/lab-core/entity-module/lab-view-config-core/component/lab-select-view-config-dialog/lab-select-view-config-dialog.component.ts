import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';

@Component({
  selector: 'lab-select-view-config-dialog',
  templateUrl: './lab-select-view-config-dialog.component.html',
  styleUrls: ['./lab-select-view-config-dialog.component.scss']
})
export class LabSelectViewConfigDialogComponent implements OnInit {

  reportId: string;

  constructor(@Inject(MAT_DIALOG_DATA) reportId: string,
              private dialogRef: MatDialogRef<LabSelectViewConfigDialogComponent>) {
    this.reportId = reportId;
  }

  ngOnInit(): void {
  }

  onViewConfigSelected(viewConfig: LabViewConfig): void {
    if(viewConfig.viewType) {
      this.dialogRef.close(viewConfig);
    }

    this.dialogRef.close(viewConfig);
  }

}
