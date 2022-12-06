import {Component, OnInit} from '@angular/core';
import {CaLabInstance, CaLabInstanceDatasource} from '../../../../ca-core/model/entities/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../../ca-core/service-api/ca-lab-instance.service';
import {FlTableColumn} from '@monorepo/front-core-lib';

/**
 * Component for space admin to list all the lab of the space
 */
@Component({
  selector: 'ca-current-space-lab-instances-list',
  templateUrl: './ca-current-space-lab-instances-list.component.html',
  styleUrls: ['./ca-current-space-lab-instances-list.component.scss']
})
export class CaCurrentSpaceLabInstancesListComponent implements OnInit {

  labInstances: CaLabInstanceDatasource;

  displayedColumns: FlTableColumn<CaLabInstance>[] = ['name', 'currentStatus',
    {accessor: 'virtualHost', columnName: 'virtual_host'}, 'serverInfo'];

  constructor(private labInstanceService: CaLabInstanceService) { }

  ngOnInit(): void {
    this.labInstances = this.labInstanceService.getAllByCurrentSpaceDatasource();
  }

}
