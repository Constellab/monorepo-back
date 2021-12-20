import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {ClOnChange} from '@monorepo/core-lib';
import {LabRouterService} from '../../../../service/lab-router.service';

@Component({
  selector: 'lab-resource-card',
  templateUrl: './lab-resource-card.component.html',
  styleUrls: ['./lab-resource-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabResourceCardComponent implements OnInit {

  // update the resource detail route on input change
  @ClOnChange(function (this: LabResourceCardComponent, resource: LabResource) {
    if (resource == null) {
      this.resourceDetailRoute = null;
    } else {
      this.resourceDetailRoute = LabRouterService.getResourceDetailRoute(resource.id);
    }
  })
  @Input() resource: LabResource;

  resourceDetailRoute: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
