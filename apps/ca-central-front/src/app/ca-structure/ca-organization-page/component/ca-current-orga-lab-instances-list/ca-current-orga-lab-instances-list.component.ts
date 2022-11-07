import {Component, OnInit} from '@angular/core';
import {CaLabInstance, CaLabInstanceDatasource} from '../../../../ca-core/model/entities/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../../ca-core/service-api/ca-lab-instance.service';
import {FlTableColumn} from '@monorepo/front-core-lib';

/**
 * Component for organization admin to list all the lab of the organization
 */
@Component({
  selector: 'ca-current-orga-lab-instances-list',
  templateUrl: './ca-current-orga-lab-instances-list.component.html',
  styleUrls: ['./ca-current-orga-lab-instances-list.component.scss']
})
export class CaCurrentOrgaLabInstancesListComponent implements OnInit {

  labInstances: CaLabInstanceDatasource;

  displayedColumns: FlTableColumn<CaLabInstance>[] = ['name', 'currentStatus',
    {accessor: 'virtualHost', columnName: 'virtual_host'}, 'serverInfo'];

  constructor(private labInstanceService: CaLabInstanceService) { }

  ngOnInit(): void {
    this.labInstances = this.labInstanceService.getCurrentLabInstancesDatasource();
  }

}
