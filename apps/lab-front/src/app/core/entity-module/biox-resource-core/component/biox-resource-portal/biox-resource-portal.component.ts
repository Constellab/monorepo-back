import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-biox-resource-portal',
  templateUrl: './biox-resource-portal.component.html',
  styleUrls: ['./biox-resource-portal.component.scss']
})
export class BioxResourcePortalComponent implements OnInit {

  resourceId: string;

  constructor(@Inject(FL_PORTAL_DATA) resourceId: string) {
    this.resourceId = resourceId;
  }

  ngOnInit(): void {
  }
}
