import {Component, OnInit, Optional} from '@angular/core';
import {LabResourceViewResourcesList} from '../../../../model/entities/resource/lab-resource-view.entity';
import {FlArrayObs, FlEntityArrayObs, FlTableColumn} from '@monorepo/front-core-lib';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {ClCoreJsonConvert} from '@monorepo/core-lib';
import {RvResourceViewDirective} from '@monorepo/resource-view';
import {LabResourceDetailTabsState} from '../../state/lab-resource-detail-tabs-state.service';

/**
 * View of resource that show a list of other resources
 */
@Component({
  selector: 'lab-resource-view-list',
  templateUrl: './lab-resource-view-list.component.html',
  styleUrls: ['./lab-resource-view-list.component.scss']
})
export class LabResourceViewListComponent extends RvResourceViewDirective<LabResourceViewResourcesList>
  implements OnInit {

  datasource: FlArrayObs<LabResource>;

  columns: FlTableColumn<LabResource>[] = ['name',
    {columnName: 'resource_type', accessor: 'resourceTypeHumanName'}, 'tags', 'preview', 'openInNewTab'];

  selectableRow: boolean;

  constructor(@Optional() private resourceTabState: LabResourceDetailTabsState) {
    super();
  }

  ngOnInit(): void {
    const resources = ClCoreJsonConvert.deserialize(this.view.data, LabResource) as LabResource[];
    this.datasource = new FlEntityArrayObs(resources);

    // if this component is under the ResourceDetailTabsComponent, we don't use link but trigger a resource view load
    // on sub resource clic
    this.selectableRow = this.resourceTabState != null;
  }

  openInNewTab(resource: LabResource): void {
    if (this.resourceTabState) {
      this.resourceTabState.addResourceTab(resource.id);
    }
  }

}
