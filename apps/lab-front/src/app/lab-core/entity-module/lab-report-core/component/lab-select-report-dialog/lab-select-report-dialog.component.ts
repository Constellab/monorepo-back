import {Component, OnInit} from '@angular/core';
import {LabReport} from '../../../../model/entities/lab-report.entity';
import {MatDialogRef} from '@angular/material/dialog';

/**
 * Dialog that used the report search to select a report
 */
@Component({
  selector: 'lab-select-report-dialog',
  templateUrl: './lab-select-report-dialog.component.html',
  styleUrls: ['./lab-select-report-dialog.component.scss']
})
export class LabSelectReportDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<LabSelectReportDialogComponent>) {
  }

  ngOnInit(): void {
  }


  onReportSelected(report: LabReport): void {
    this.dialogRef.close(report);
  }
}
