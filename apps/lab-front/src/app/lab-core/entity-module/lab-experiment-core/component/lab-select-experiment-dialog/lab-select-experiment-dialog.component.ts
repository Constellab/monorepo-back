import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';

/**
 * Dialog to search on experiment and select one
 *
 * The dialog is closed when a experiment is selected
 */
@Component({
  selector: 'lab-select-experiment-dialog',
  templateUrl: './lab-select-experiment-dialog.component.html',
  styleUrls: ['./lab-select-experiment-dialog.component.scss']
})
export class LabSelectExperimentDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<LabSelectExperimentDialogComponent>) {
  }

  ngOnInit(): void {
  }

  onExperimentSelected(experiment: LabExperiment): void {
    this.dialogRef.close(experiment);
  }

}
