import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

@Component({
  selector: 'lab-resource-detail-dialog',
  templateUrl: './lab-resource-detail-dialog.component.html',
  styleUrls: ['./lab-resource-detail-dialog.component.scss']
})
export class LabResourceDetailDialogComponent implements OnInit {

  resourceId: string;

  constructor(@Inject(MAT_DIALOG_DATA) resourceId: string) {
    this.resourceId = resourceId;
  }

  ngOnInit(): void {
  }

}
