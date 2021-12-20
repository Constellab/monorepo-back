import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-resource-portal',
  templateUrl: './lab-resource-portal.component.html',
  styleUrls: ['./lab-resource-portal.component.scss']
})
export class LabResourcePortalComponent implements OnInit {

  resourceId: string;

  constructor(@Inject(FL_PORTAL_DATA) resourceId: string) {
    this.resourceId = resourceId;
  }

  ngOnInit(): void {
  }
}
