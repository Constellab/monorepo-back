import {Component, OnInit} from '@angular/core';
import {LabResourceViewResourcesList} from '../../../../model/entities/resource/lab-resource-view.entity';
import {FlArrayObs, FlEntityArrayObs, FlTableColumn} from '@monorepo/front-core-lib';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {ClCoreJsonConvert} from '@monorepo/core-lib';
import {RvResourceViewDirective} from '@monorepo/resource-view';

/**
 * View of resource that show a list of other resources
 */
@Component({
  selector: 'lab-resources-list',
  templateUrl: './lab-resources-list.component.html',
  styleUrls: ['./lab-resources-list.component.scss']
})
export class LabResourcesListComponent extends RvResourceViewDirective<LabResourceViewResourcesList>
  implements OnInit {

  datasource: FlArrayObs<LabResource>;

  columns: FlTableColumn<LabResource>[] = ['name', 'info',
    {columnName: 'resource_type', accessor: 'resourceTypeHumanName'}, 'tags'];


  ngOnInit(): void {
    const resources = ClCoreJsonConvert.deserialize(this.view.data, LabResource) as LabResource[];
    this.datasource = new FlEntityArrayObs(resources);
  }

}
