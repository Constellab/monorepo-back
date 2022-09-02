import {Component, Inject, OnInit} from '@angular/core';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {Observable} from 'rxjs';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LabConfigValues} from '../../../../model/entities/lab-config.entity';
import {RvTransformerParams} from '@monorepo/resource-view';

export type LabResourceViewDetailDialogInput = {
  mode: 'defaultView',
  resourceId: string;
  resourceName: string;
  saveViewConfig: boolean;
} | {
  mode: 'view',
  resourceId: string;
  resourceName: string;
  viewMethodName: string;
  saveViewConfig: boolean;
  config: LabConfigValues;
  transformers: RvTransformerParams[];
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
    if (this.input.mode === 'defaultView') {
      this.labView$ = this.resourceService.callResourceDefaultView(this.input.resourceId, this.input.saveViewConfig);
    } else {
      this.labView$ = this.resourceService.callResourceView(this.input.resourceId, this.input.viewMethodName,
        this.input.config, this.input.transformers, this.input.saveViewConfig);
    }
  }

}
