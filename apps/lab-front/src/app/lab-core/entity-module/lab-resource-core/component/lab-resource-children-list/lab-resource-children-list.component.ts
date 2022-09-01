import {Component, Input, OnInit} from '@angular/core';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {FlArrayObs, FlEntityArrayObs, FlTableColumn} from '@monorepo/front-core-lib';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabResourceDetailTabsState} from '../../state/lab-resource-detail-tabs-state.service';

/**
 * Component in the lab resource detail to show the list of children resources
 */
@Component({
  selector: 'lab-resource-children-list',
  templateUrl: './lab-resource-children-list.component.html',
  styleUrls: ['./lab-resource-children-list.component.scss']
})
export class LabResourceChildrenListComponent implements OnInit {

  @Input() resourceId: string;

  resources$: FlArrayObs<LabResource>;

  columns: FlTableColumn<LabResource>[] = ['name', 'type', 'tags', 'preview'];


  constructor(private resourceService: LabResourceService,
              private resourceTabState: LabResourceDetailTabsState) {
  }

  ngOnInit(): void {
    this.resources$ = new FlEntityArrayObs(this.resourceService.getResourceChildren(this.resourceId));
  }

  openInNewTab(resource: LabResource): void {
    if (this.resourceTabState) {
      this.resourceTabState.addResourceTab(resource.id);
    }
  }

}
