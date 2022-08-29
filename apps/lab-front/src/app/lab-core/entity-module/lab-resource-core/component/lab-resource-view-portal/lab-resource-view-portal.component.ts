import {Component, Inject, OnInit} from '@angular/core';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {FL_PORTAL_DATA, FlMenuDynamic} from '@monorepo/front-core-lib';
import {RvViewConfig} from '@monorepo/resource-view';


export interface LabResourceViewPortalInput {
  labView: LabResourceView;
  contextMenuItems?: FlMenuDynamic[];
}

/**
 * Portal to show a resource view
 */
@Component({
  selector: 'lab-resource-view-portal',
  templateUrl: './lab-resource-view-portal.component.html',
  styleUrls: ['./lab-resource-view-portal.component.scss']
})
export class LabResourceViewPortalComponent implements OnInit {

  labView: LabResourceView;
  rvConfig: RvViewConfig;
  contextMenuItems?: FlMenuDynamic[];

  width: string;
  height: string;


  constructor(@Inject(FL_PORTAL_DATA) private input: LabResourceViewPortalInput) {
    this.labView = input.labView;
    this.rvConfig = {
      methodName: input.labView.viewConfig.viewName,
      configValues: input.labView.viewConfig.configValues,
      transformers: input.labView.viewConfig.transformers
    };
    this.contextMenuItems = input.contextMenuItems;

    if (input.labView.view.type === 'multi-view') {
      this.width = 'min(1000px, 90vw)';
      this.height = 'min(1000px, 90vh)';
    } else {
      this.width = '660px';
      this.height = '600px';
    }
  }

  ngOnInit(): void {
  }

}
