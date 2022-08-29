import {Component, Inject, OnInit} from '@angular/core';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {Observable} from 'rxjs';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface LabResourceViewDetailDialogInput {
  resourceId: string;
  resourceName: string;
}

@Component({
  selector: 'lab-resource-view-detail-dialog',
  templateUrl: './lab-resource-view-detail-dialog.component.html',
  styleUrls: ['./lab-resource-view-detail-dialog.component.scss']
})
export class LabResourceViewDetailDialogComponent implements OnInit {

  title: string;

  labView$: Observable<LabResourceView>;

  constructor(@Inject(MAT_DIALOG_DATA) private input: LabResourceViewDetailDialogInput,
              private resourceService: LabResourceService) {
    this.title = input.resourceName;
  }

  ngOnInit(): void {
    this.labView$ = this.resourceService.callResourceDefaultView(this.input.resourceId);
  }

}
