import {Component, OnInit} from '@angular/core';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';
import {MatDialogRef} from '@angular/material/dialog';

/**
 * Dialog to search on experiment and select one
 *
 * The dialog is closed when an experiment is selected
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
