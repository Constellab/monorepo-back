import {Component, Inject, OnInit} from '@angular/core';
import {
  LabResourceView,
  LabResourceViewSpecWithConfig
} from '../../../../model/entities/resource/lab-resource-view.entity';
import {FL_PORTAL_DATA, FlCoord} from '@monorepo/front-core-lib';
import {Subject} from 'rxjs';


export interface LabResourceViewPortalInput {
  view: LabResourceView;
  resourceId: string;
  config: LabResourceViewSpecWithConfig;
}

@Component({
  selector: 'lab-resource-view-portal',
  templateUrl: './lab-resource-view-portal.component.html',
  styleUrls: ['./lab-resource-view-portal.component.scss']
})
export class LabResourceViewPortalComponent implements OnInit {

  view: LabResourceView;
  resourceId: string;
  config: LabResourceViewSpecWithConfig;

  width: string;
  height: string;

  private size$ = new Subject<FlCoord>();

  constructor(@Inject(FL_PORTAL_DATA) private input: LabResourceViewPortalInput) {
    this.view = input.view;
    this.resourceId = input.resourceId;
    this.config = input.config;

    if (input.view.type === 'multi-view') {
      this.width = 'min(1000px, 90vw)';
      this.height = 'min(1000px, 90vh)';
    }
    // else{
    //   this.width = '400px';
    //   this.height = '400px';
    // }
  }

  ngOnInit(): void {
    this.size$.next({x: 400, y: 400});
  }

}
