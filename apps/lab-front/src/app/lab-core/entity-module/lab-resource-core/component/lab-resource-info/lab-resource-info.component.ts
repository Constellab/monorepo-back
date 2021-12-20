import {Component, Input, OnInit} from '@angular/core';
import {LabRouterService} from '../../../../service/lab-router.service';

/**
 * Simple component to display information about a {@link LabResource}
 */
@Component({
  selector: 'lab-resource-info',
  templateUrl: './lab-resource-info.component.html',
  styleUrls: ['./lab-resource-info.component.scss']
})
export class LabResourceInfoComponent implements OnInit {

  @Input() resourceId: string;

  resourceDetailUrl: string;

  constructor() {
  }

  ngOnInit(): void {
    this.resourceDetailUrl = LabRouterService.getResourceDetailRoute(this.resourceId);
  }

}
